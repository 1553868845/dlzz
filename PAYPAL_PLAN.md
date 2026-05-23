# PayPal 支付对接 + 购物车 + 订单系统 实施方案

## Context

清利肽多肽商城当前是纯询价模式——用户浏览产品后通过联系表单或 WhatsApp 下单，没有在线支付能力。需要在现有架构上新增 PayPal Checkout 支付、购物车和完整订单管理系统，使用户可以直接在产品页加入购物车并完成在线付款。

## 技术选型

| 层面 | 选择 | 原因 |
|------|------|------|
| 支付方式 | PayPal Checkout (JavaScript SDK) | 买家跳转 PayPal 付款，无需处理信用卡数据，PCI 合规最简单 |
| PayPal API | PayPal REST API v2 (Orders API) | 服务端创建订单 + 捕获付款，前后端分离 |
| 购物车 | 前端 localStorage | 无公开用户注册系统，localStorage 最简单且满足需求 |
| 订单记录 | MySQL 新表 | 复用现有 MySQL，MyBatis 访问 |

## PayPal Checkout 支付流程

```
用户加购 → 购物车页面 → 填写收货信息 → 点击"PayPal 付款"
  → 前端调用 POST /api/paypal/create-order（传入选中的商品列表）
  → 后端调用 PayPal Orders API 创建订单 → 返回 orderID 给前端
  → 前端渲染 PayPal 按钮，用户授权付款
  → 用户授权后，前端调用 POST /api/paypal/capture-order（传入 orderID）
  → 后端调用 PayPal API 捕获付款 → 写入本地订单表 → 返回确认信息
  → 前端跳转订单确认页
```

## 实施步骤

### 第一步：数据库 — 新增订单表

在 `db/schema.sql` 中新增两张表（后续也要写迁移脚本）：

**`orders` 表：**
- id (BIGINT PK AUTO_INCREMENT)
- order_number (VARCHAR(32) UNIQUE) — 生成格式如 QL-20260519-XXXX
- customer_name, customer_email, customer_phone, customer_company
- total_amount (DECIMAL(10,2)) — 订单总金额 USD
- currency (VARCHAR(3) DEFAULT 'USD')
- status (VARCHAR(20)) — PENDING / PAID / SHIPPED / CANCELLED / REFUNDED
- paypal_order_id (VARCHAR(255)) — PayPal 订单 ID
- paypal_capture_id (VARCHAR(255)) — PayPal 捕获 ID
- paypal_payer_email (VARCHAR(255))
- notes (TEXT)
- created_at, updated_at (DATETIME)

**`order_items` 表：**
- id (BIGINT PK AUTO_INCREMENT)
- order_id (BIGINT FK → orders.id)
- product_id (BIGINT FK → products.id)
- product_name (VARCHAR(255)) — 下单时的产品名（快照）
- quantity (INT)
- unit_price (DECIMAL(10,2))
- subtotal (DECIMAL(10,2))

### 第二步：后端 — PayPal 集成

**2.1 Maven 依赖** (`pom.xml`)
- 不需要 PayPal SDK，直接使用 Spring RestTemplate 调用 PayPal REST API
- PayPal API 端点：创建订单 `POST /v2/checkout/orders`，捕获付款 `POST /v2/checkout/orders/{id}/capture`

**2.2 配置** (`application.yml`)
```yaml
paypal:
  client-id: ${PAYPAL_CLIENT_ID}
  client-secret: ${PAYPAL_CLIENT_SECRET}
  mode: sandbox  # sandbox / live
```

**2.3 新建文件：**
- `config/PayPalConfig.java` — 配置类，管理 clientId/secret/mode/baseUrl
- `service/PayPalService.java` — 核心服务
  - `createOrder(CreateOrderRequest request)` — 向 PayPal 创建订单，返回 orderID
  - `captureOrder(String orderId)` — 捕获已授权的付款，返回交易详情
  - `getAccessToken()` — 获取 PayPal OAuth2 access token
- `dto/PayPalCreateOrderRequest.java` — 前端传入的商品列表 DTO
- `dto/PayPalOrderResponse.java` — 返回给前端的 orderID + 金额
- `controller/PayPalController.java`
  - `POST /api/paypal/create-order` — 创建 PayPal 订单
  - `POST /api/paypal/capture-order` — 捕获付款 + 写入本地订单

**2.4 PayPal API 调用细节（PayPalService）：**
- 获取 token：POST `{baseUrl}/v1/oauth2/token`，Basic Auth（clientId:secret），grant_type=client_credentials
- 创建订单：POST `{baseUrl}/v2/checkout/orders`，Bearer token，body 包含 intent=CAPTURE、purchase_units（金额+商品明细）、application_context（return_url、cancel_url）
- 捕获付款：POST `{baseUrl}/v2/checkout/orders/{id}/capture`，Bearer token

### 第三步：后端 — 订单管理

**3.1 新建文件：**
- `entity/Order.java` — 订单实体
- `entity/OrderItem.java` — 订单项实体
- `mapper/OrderMapper.java` — 订单 Mapper 接口
  - `insertOrder(Order order)` + `insertOrderItem(OrderItem item)`
  - `findByOrderNumber(String orderNumber)`
  - `findAll(int offset, int limit)` — 分页查询（管理员）
  - `updateStatus(Long id, String status)`
  - `count()` — 总订单数
- `mapper/OrderMapper.xml` — SQL XML 映射文件
- `controller/OrderController.java`
  - `GET /api/orders/lookup?number=xxx&email=xxx` — 公开：用户查自己的订单
  - `GET /api/admin/orders` — 管理员：分页订单列表
  - `GET /api/admin/orders/{id}` — 管理员：订单详情
  - `PUT /api/admin/orders/{id}/status` — 管理员：更新订单状态

### 第四步：前端 — PayPal SDK 加载

在 `index.html` 中加载 PayPal JavaScript SDK：
```html
<script src="https://www.paypal.com/sdk/js?client-id=CLIENT_ID&currency=USD" defer></script>
```
- Client ID 通过构建时环境变量 `VITE_PAYPAL_CLIENT_ID` 注入
- Sandbox 和 Live 使用不同的 client-id

### 第五步：前端 — 购物车系统

**5.1 新建文件：**
- `src/context/CartContext.tsx` — 购物车状态管理
  - 从 localStorage 读取/写入购物车
  - `addToCart(product, quantity)` — 添加商品
  - `removeFromCart(productId)` — 移除商品
  - `updateQuantity(productId, quantity)` — 修改数量
  - `clearCart()` — 清空购物车
  - `cartItems` / `cartCount` / `cartTotal` — 计算属性

**5.2 修改现有文件：**
- `Navbar.tsx` — 添加购物车图标 + 数量徽章
- `ProductCard.tsx` — 添加"加入购物车"按钮
- `ProductDetailPage.tsx` — 添加数量选择 + "加入购物车"按钮

### 第六步：前端 — 新增页面

**6.1 购物车页面** `src/pages/CartPage.tsx`
- 展示购物车商品列表（图片、名称、单价、数量调整、小计、删除）
- 汇总总金额
- "去结算"按钮 → 跳转结算页

**6.2 结算页面** `src/pages/CheckoutPage.tsx`
- 收货信息表单（姓名、邮箱、电话、公司、备注）
- 订单摘要（商品列表 + 金额）
- PayPal 按钮区域（手动调用 window.paypal.Buttons()）
- 支付流程：
  1. 点击 PayPal 按钮 → 触发 `createOrder` 回调（调后端 API）
  2. 用户授权 → 触发 `onApprove` 回调（调后端 capture API）
  3. 成功后 → 清空购物车 → 跳转确认页

**6.3 订单确认页** `src/pages/OrderConfirmPage.tsx`
- 显示订单号、金额、商品清单
- 提示用户保存订单号以便查询

**6.4 订单查询页** `src/pages/OrderLookupPage.tsx`
- 输入订单号 + 邮箱 → 查询订单状态

**6.5 路由更新** (`App.tsx`)
- 新路由：`/cart`、`/checkout`、`/order-confirm/:orderNumber`、`/order-lookup`

### 第七步：前端 — 管理员订单管理

**7.1 新建文件：**
- `src/admin/pages/AdminOrders.tsx` — 管理员订单列表
  - 表格展示（订单号、客户、金额、状态、时间）
  - 状态筛选（全部/待付款/已付款/已发货/已取消）
  - 点击查看详情
  - 状态更新操作按钮

**7.2 修改文件：**
- `AdminLayout.tsx` — 侧边栏添加"订单管理"菜单项
- `AdminDashboard.tsx` — 控制面板增加订单统计卡片

### 第八步：前端 — API 层更新

修改 `src/api/index.ts`，新增 API 函数：
- `createPayPalOrder(items)` — POST `/api/paypal/create-order`
- `capturePayPalOrder(orderId)` — POST `/api/paypal/capture-order`
- `lookupOrder(number, email)` — GET `/api/orders/lookup`
- `getAdminOrders(page, size, status)` — GET `/api/admin/orders`
- `getAdminOrderDetail(id)` — GET `/api/admin/orders/{id}`
- `updateOrderStatus(id, status)` — PUT `/api/admin/orders/{id}/status`

### 第九步：环境变量与配置

**新增 .env 变量：**
- `PAYPAL_CLIENT_ID` — PayPal 应用 Client ID
- `PAYPAL_CLIENT_SECRET` — PayPal 应用 Secret
- `PAYPAL_MODE` — sandbox / live

**docker-compose.yml 更新：**
- backend 服务添加 `PAYPAL_CLIENT_ID`、`PAYPAL_CLIENT_SECRET`、`PAYPAL_MODE` 环境变量

**前端 PayPal Client ID：**
- 通过构建时环境变量 `VITE_PAYPAL_CLIENT_ID` 注入

### 第十步：国际化

更新三个翻译文件 (`en.ts`、`zh.ts`、`es.ts`)：
- 购物车相关文案（标题、空购物车、总计、去结算等）
- 结算页文案（收货信息、支付方式、订单摘要等）
- 订单确认页文案
- 订单查询页文案
- 订单状态文案（待付款/已付款/已发货/已取消）

## 关键文件清单

### 新建文件（后端）
- `backend/src/main/java/com/qingli/mall/config/PayPalConfig.java`
- `backend/src/main/java/com/qingli/mall/service/PayPalService.java`
- `backend/src/main/java/com/qingli/mall/controller/PayPalController.java`
- `backend/src/main/java/com/qingli/mall/entity/Order.java`
- `backend/src/main/java/com/qingli/mall/entity/OrderItem.java`
- `backend/src/main/java/com/qingli/mall/mapper/OrderMapper.java`
- `backend/src/main/resources/mapper/OrderMapper.xml`
- `backend/src/main/java/com/qingli/mall/controller/OrderController.java`
- `backend/src/main/java/com/qingli/mall/dto/PayPalCreateOrderRequest.java`
- `backend/src/main/java/com/qingli/mall/dto/PayPalOrderResponse.java`

### 新建文件（前端）
- `frontend/src/context/CartContext.tsx`
- `frontend/src/pages/CartPage.tsx`
- `frontend/src/pages/CheckoutPage.tsx`
- `frontend/src/pages/OrderConfirmPage.tsx`
- `frontend/src/pages/OrderLookupPage.tsx`
- `frontend/src/admin/pages/AdminOrders.tsx`

### 修改文件（后端）
- `backend/pom.xml` — 无新增依赖（使用 RestTemplate）
- `backend/src/main/resources/application.yml` — 新增 PayPal 配置项
- `backend/src/main/java/com/qingli/mall/config/SecurityConfig.java` — 新增公开 API 路径放行

### 修改文件（前端）
- `frontend/src/App.tsx` — 新增路由
- `frontend/src/api/index.ts` — 新增 API 函数
- `frontend/src/types/index.ts` — 新增 TypeScript 类型
- `frontend/src/components/Navbar.tsx` — 添加购物车图标
- `frontend/src/components/ProductCard.tsx` — 添加加购按钮
- `frontend/src/pages/ProductDetailPage.tsx` — 添加加购按钮
- `frontend/src/admin/AdminLayout.tsx` — 侧边栏添加订单菜单
- `frontend/src/admin/pages/AdminDashboard.tsx` — 添加订单统计
- `frontend/src/i18n/en.ts, zh.ts, es.ts` — 新增翻译文案

### 修改文件（配置）
- `db/schema.sql` — 新增 orders + order_items 表
- `docker-compose.yml` — 新增 PayPal 环境变量
- `.env.example` — 新增 PayPal 配置项示例

## 验证方案

1. **单元验证**：后端 PayPalService 使用 sandbox 模式，调用创建订单 + 捕获付款，确认返回正确
2. **数据库验证**：启动 MySQL，运行建表 SQL，确认 orders/order_items 表创建成功
3. **购物车验证**：前端添加商品到购物车，刷新页面确认数据持久化在 localStorage
4. **端到端验证**（Sandbox）：
   - 启动完整 Docker Compose 环境
   - 访问前端，添加多个产品到购物车
   - 进入结算页，填写信息，点击 PayPal 按钮
   - 使用 PayPal Sandbox 买家账号完成付款
   - 确认跳转订单确认页，订单号正确
   - 管理员后台查看订单，修改状态
   - 用户通过订单号查询订单状态
