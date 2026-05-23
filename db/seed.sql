-- ============================================================
-- Qing Li Mall  初始化数据脚本（seed）v2.0
-- 在 schema.sql 之后执行
-- 数据来源：从 43.159.171.238 线上数据库备份（2026-05-06）
-- ============================================================
USE dianshang;

-- 修复 slug 为空的情况
UPDATE products   SET slug = CONCAT('product-', id)           WHERE slug IS NULL OR slug = '';
UPDATE categories SET slug = LOWER(REPLACE(name, ' ', '-'))   WHERE slug IS NULL OR slug = '';

-- ─── 产品分类 ───────────────────────────────────────────────
INSERT IGNORE INTO categories (id, name, slug, sort_order) VALUES
(1, 'Peptides',       'peptides',       1),
(2, 'Research Chems', 'research-chems', 2),
(3, 'Recovery',       'recovery',       3),
(4, 'Anti-Aging',     'anti-aging',     4);

-- ─── 产品（含中文字段） ─────────────────────────────────────
INSERT IGNORE INTO products
  (id, category_id, name, slug, subtitle, short_desc, purity, form_type, storage, specification,
   stock_status, is_featured, image, sort_order,
   name_zh, subtitle_zh, short_desc_zh, purity_zh, form_zh, storage_zh, specification_zh,
   name_es, subtitle_es)
VALUES
(1, 1, 'BPC-157', 'bpc-157', 'Body Protection Compound 157',
  'Synthetic peptide for tissue repair research.', '>=99%', 'Lyophilized Powder', '-20C Freezer', '5mg/vial',
  1, 1, '/minio-static/images/products/c89191fe-705f-4c4a-aa35-63466ba1f8e0.png', 1,
  'BPC-157', '身体保护化合物 157', '用于组织修复研究的合成肽。', '>=99%', '冻干粉', '-20°C 冷冻保存', '5mg/瓶',
  'BPC1-157', 'Compuesto de Protección Corporal 157'),
(2, 1, 'TB-500', 'tb-500', 'Thymosin Beta-4 Fragment',
  'Thymosin Beta-4 fragment for recovery research.', '>=99%', 'Lyophilized Powder', '-20C Freezer', '5mg/vial',
  1, 1, '/minio-static/images/products/c89191fe-705f-4c4a-aa35-63466ba1f8e0.png', 2,
  'TB-500', '胸腺素 Beta-4 片段', '用于恢复研究的胸腺素 Beta-4 片段。', '>=99%', '冻干粉', '-20°C 冷冻保存', '5mg/瓶',
  NULL, NULL),
(3, 1, 'Semaglutide', 'semaglutide', 'GLP-1 Receptor Agonist',
  'GLP-1 receptor agonist for metabolic research.', '>=98%', 'Lyophilized Powder', '-20C Freezer', '5mg/vial',
  1, 1, '/minio-static/images/products/c89191fe-705f-4c4a-aa35-63466ba1f8e0.png', 3,
  '司美格鲁肽', 'GLP-1 受体激动剂', '用于代谢研究的 GLP-1 受体激动剂。', '>=98%', '冻干粉', '-20°C 冷冻保存', '5mg/瓶',
  NULL, NULL),
(4, 1, 'Tirzepatide', 'tirzepatide', 'Dual GIP/GLP-1 Agonist',
  'Dual GIP/GLP-1 receptor agonist for research.', '>=98%', 'Lyophilized Powder', '-20C Freezer', '5mg/vial',
  1, 1, '/minio-static/images/products/c89191fe-705f-4c4a-aa35-63466ba1f8e0.png', 4,
  '替尔泊肽', '双重 GIP/GLP-1 激动剂', '用于代谢研究的双重 GIP/GLP-1 受体激动剂。', '>=98%', '冻干粉', '-20°C 冷冻保存', '5mg/瓶',
  NULL, NULL);

-- ─── FAQ（含中英西三语）────────────────────────────────────
INSERT IGNORE INTO faq (id, question, answer, category, sort_order, published,
  question_zh, answer_zh, question_es, answer_es) VALUES
(1,
  'What purity levels do your peptides have?',
  'All peptides are >=98% purity, verified by HPLC. COA available.',
  'Quality', 1, 1,
  '你们的肽类产品纯度如何？',
  '我们所有肽类产品均通过HPLC检测，纯度≥99%，并随附质检报告（COA）。',
  'Que niveles de pureza tienen sus peptidos?',
  'Todos nuestros peptidos tienen una pureza >=98%, verificada por HPLC. Se proporciona COA con cada pedido.'),
(2,
  'How should peptides be stored?',
  'Lyophilized peptides at -20C. Once reconstituted, 4C, use within 30 days.',
  'Storage', 2, 1,
  '肽类产品应如何储存？',
  '建议将肽类产品密封后存放于-20°C冷冻环境中，避免反复冻融。使用时在室温下缓慢解冻即可。',
  'Como se deben almacenar los peptidos?',
  'Los peptidos liofilizados deben almacenarse a -20C. Una vez reconstituidos, mantener a 4C y consumir en 30 dias.'),
(3,
  'What payment methods do you accept?',
  'Cryptocurrency (USDT, BTC, ETH) and bank wire transfer.',
  'Payment', 3, 1,
  '支持哪些付款方式？',
  '我们接受PayPal、比特币（BTC）、USDT和USDC付款。',
  'Que metodos de pago aceptan?',
  'Aceptamos criptomonedas (USDT, BTC, ETH) y transferencia bancaria.'),
(4,
  'Do you ship internationally?',
  'Yes, worldwide with discreet packaging. 3-15 business days.',
  'Shipping', 4, 1,
  '是否支持国际发货？',
  '是的，我们从香港向全球发货，通常7–14个工作日内送达。',
  'Realizan envios internacionales?',
  'Si, enviamos a todo el mundo con embalaje discreto. El plazo de entrega es de 3 a 15 dias habiles.'),
(5,
  'Do you provide a Certificate of Analysis?',
  'Yes, every product includes a third-party lab COA.',
  'Quality', 5, 1,
  '是否提供质检报告（COA）？',
  '是的，每批次产品均附有独立的质检报告，包含HPLC纯度数据及质谱分析结果。',
  'Proporcionan un Certificado de Analisis (COA)?',
  'Si, cada producto incluye un COA de laboratorio independiente con datos de pureza HPLC y analisis de espectrometria de masas.');

-- ─── 首页统计数字 ──────────────────────────────────────────
INSERT IGNORE INTO stat_item (id, label, value, icon, sort_order, label_zh, label_es) VALUES
(1, 'Products',         '200+',  'package', 1, '产品种类',     'Productos'),
(2, 'Happy Customers',  '5000+', 'users',   2, '满意客户',     'Clientes'),
(3, 'Countries',        '50+',   'globe',   3, '覆盖国家',     'Países'),
(4, 'Years Experience', '8+',    'award',   4, '行业经验（年）', 'Años de Experiencia');

-- ─── 网站配置 ──────────────────────────────────────────────
INSERT IGNORE INTO site_config (cfg_key, cfg_value, description) VALUES
('site_name',          'Qing Li Peptide',               '网站名称'),
('company_email',      'info@qinglipeptide.com',         '公司邮箱'),
('whatsapp',           '+852 4748-8025',                 'WhatsApp'),
('working_hours',      'Mon-Fri  8:00 AM - 6:00 PM',    '工作时间'),
('hero_title',         'Reliable, High-Quality Peptides','首页Hero标题'),
('hero_subtitle',      'For Research, Pharmaceuticals, and Biotech','首页Hero副标题'),
('recipient_email',    'info@qinglipeptide.com',         '留言通知收件邮箱'),
('contact_email',      'info@qinglipeptide.com',         '联系邮箱'),
('whatsapp_rotate_index', '0',                           'WhatsApp轮换索引');

-- ─── 管理员账号（密码: admin123） ─────────────────────────
-- BCrypt hash of "admin123" (generated with bcrypt cost=10, $2a$ prefix)
INSERT IGNORE INTO users (username, password, name, role) VALUES
('admin', '$2a$10$NqfMWuyHYRCnOn6r4l07guDP7scrBYAkXJ2qV3JtaoY7lNEEwFPVC', '管理员', 'admin');

-- ─── 文章（三语言） ──────────────────────────────────────
INSERT IGNORE INTO article
  (id, title, slug, excerpt, content, category, author, published, published_at,
   title_zh, excerpt_zh, content_zh)
VALUES
(1,
  'Understanding BPC-157: A Comprehensive Research Overview',
  'understanding-bpc-157',
  'BPC-157 has emerged as one of the most studied peptides in recent years.',
  '<h2>Introduction</h2><p>BPC-157 is a synthetic peptide derived from a protein found in human gastric juice. It has been extensively studied for its regenerative properties.</p>',
  'Research', 'Qing Li Research Team', 1, '2026-04-02 11:04:58',
  'BPC-157 全面研究综述',
  '本文系统梳理 BPC-157 的研究背景、作用机制及最新科研进展。',
  'BPC-157 是一种由 15 个氨基酸组成的研究级肽，在多项临床前研究中显示出组织修复潜力。本文综述了其作用机制、研究现状及未来方向。'),
(2,
  'TB-500 and Recovery: What the Research Shows',
  'tb-500-recovery-research',
  'Thymosin Beta-4 fragment TB-500 has been the subject of numerous studies.',
  '<h2>What is TB-500?</h2><p>TB-500 is a synthetic version of Thymosin Beta-4, found in virtually all human cells and tissues.</p>',
  'Research', 'Qing Li Research Team', 1, '2026-04-02 11:04:58',
  'TB-500 与组织修复：研究进展',
  'TB-500（Thymosin Beta-4）在运动损伤和组织修复领域的研究进展综述。',
  'TB-500 是胸腺素 β-4 的合成片段，多项临床前研究表明其在软组织修复中具有潜在价值。本文梳理了相关研究数据与最新进展。'),
(3,
  'GLP-1 Agonists: Semaglutide and Tirzepatide Science',
  'glp1-agonists-science',
  'GLP-1 receptor agonists represent a fascinating class of research compounds.',
  '<h2>GLP-1 Overview</h2><p>GLP-1 receptor agonists mimic the GLP-1 hormone and have been studied extensively in metabolic research.</p>',
  'Science', 'Qing Li Research Team', 1, '2026-04-02 11:04:58',
  'GLP-1 受体激动剂：司美格鲁肽与替尔泊肽研究',
  'GLP-1 受体激动剂在代谢疾病研究中的最新科学进展。',
  '司美格鲁肽（Semaglutide）与替尔泊肽（Tirzepatide）是近年来代谢研究领域的热点。本文从分子机制、研究设计和主要发现三个维度进行综述。');

-- ─── WhatsApp 号码（示例，实际请在后台配置） ────────────────
-- 注：仅在表为空时插入，实际号码请在后台管理页面配置
INSERT IGNORE INTO whatsapp_numbers (id, number, label, sort_order, is_active) VALUES
(1, '+852 0000-0001', 'WhatsApp 1', 1, 1),
(2, '+852 0000-0002', 'WhatsApp 2', 2, 1),
(3, '+852 0000-0003', 'WhatsApp 3', 3, 1);

-- ─── 隐私政策 / 退款政策页面内容 ─────────────────────────
INSERT IGNORE INTO page_contents (id, slug, title, title_zh, title_es, content, content_zh, content_es) VALUES
(1, 'privacy', 'Privacy Policy', '隐私政策', 'Politica de Privacidad',
'We are committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your personal information when you visit our website or place an order.\n\n1. Information We Collect\nWe may collect your name, email address, phone number, shipping address, and payment information when you place an order or contact us.\n\n2. How We Use Your Information\nYour information is used solely to process orders, provide customer support, and improve our services. We do not sell or share your personal data with third parties for marketing purposes.\n\n3. Data Security\nWe implement industry-standard security measures to protect your personal data. All transactions are encrypted and your information is stored securely.\n\n4. Cookies\nWe use cookies to enhance your browsing experience and analyze website traffic. You may disable cookies in your browser settings.\n\n5. Third-Party Services\nWe may use third-party logistics providers for shipping. These providers are contractually obligated to protect your data.\n\n6. Your Rights\nYou have the right to access, correct, or delete your personal data. Contact us to exercise these rights.\n\n7. Changes to This Policy\nWe may update this Privacy Policy from time to time. Continued use of our website constitutes acceptance of any changes.',
'我们致力于保护您的隐私。本隐私政策说明了当您访问我们的网站或下订单时，我们如何收集、使用和保护您的个人信息。\n\n1. 我们收集的信息\n当您下单或联系我们时，我们可能会收集您的姓名、电子邮箱、电话号码、收货地址和付款信息。\n\n2. 我们如何使用您的信息\n您的信息仅用于处理订单、提供客户支持和改善我们的服务。我们不会出于营销目的向第三方出售或共享您的个人数据。\n\n3. 数据安全\n我们采用行业标准的加密技术和安全措施来保护您的个人数据。所有交易均经过加密处理。\n\n4. Cookies\n我们使用 Cookie 来增强您的浏览体验并分析网站流量。您可以在浏览器设置中禁用 Cookie。\n\n5. 第三方服务\n我们可能使用第三方物流服务商进行配送。这些服务商有合同义务保护您的数据。\n\n6. 您的权利\n您有权访问、更正或删除您的个人数据。请联系我们行使这些权利。\n\n7. 政策变更\n我们可能不时更新本隐私政策。继续使用我们的网站即表示接受任何变更。',
'Estamos comprometidos a proteger su privacidad. Esta Politica de Privacidad explica como recopilamos, usamos y protegemos su informacion personal.\n\n1. Informacion que Recopilamos\nPodemos recopilar su nombre, correo electronico, numero de telefono, direccion de envio e informacion de pago cuando realiza un pedido.\n\n2. Como Usamos su Informacion\nSu informacion se usa unicamente para procesar pedidos y brindar soporte. No vendemos ni compartimos sus datos personales con terceros.\n\n3. Seguridad de Datos\nImplementamos medidas de seguridad estandar de la industria para proteger sus datos personales.\n\n4. Cookies\nUsamos cookies para mejorar su experiencia de navegacion. Puede desactivar las cookies en su navegador.\n\n5. Servicios de Terceros\nPodemos usar proveedores de logistica de terceros para el envio, quienes estan obligados contractualmente a proteger sus datos.\n\n6. Sus Derechos\nTiene derecho a acceder, corregir o eliminar sus datos personales. Contactenos para ejercer estos derechos.\n\n7. Cambios a esta Politica\nPodemos actualizar esta Politica de Privacidad. El uso continuado de nuestro sitio web constituye la aceptacion de cualquier cambio.'),
(2, 'refund', 'Refund & Returns Policy', '退货退款政策', 'Politica de Devoluciones',
'Returns are accepted within 30 days of receipt. Items must be unused, in original packaging, and in the same condition as received.\n\nTo initiate a return, please contact our customer service team with your order number and reason for return.\n\nRefunds will be processed within 5-7 business days after we receive and inspect the returned items.\n\nShipping costs for returns are the responsibility of the buyer unless the item is defective or we made an error.\n\nWe offer exchanges for different products or sizes. Please contact us to arrange an exchange.\n\nProducts that have been opened, used, or damaged by the customer are not eligible for return or refund.\n\nFor any questions regarding returns and refunds, please contact our customer service team.',
'商品签收后30天内可退换。商品必须未经使用，保持原包装完好，且与收到的状态一致。\n\n如需退货，请联系我们的客服团队，提供您的订单编号和退货原因。\n\n我们收到并检查退回商品后，将在5-7个工作日内处理退款。\n\n退货运费由买方承担，除非商品有缺陷或我们出错。\n\n我们支持更换不同产品或规格，请联系我们安排换货。\n\n已被打开、使用或因客户原因损坏的商品不符合退货或退款条件。\n\n如有任何关于退货和退款的问题，请联系我们的客服团队。',
'Se aceptan devoluciones dentro de los 30 dias posteriores a la recepcion. Los articulos deben estar sin usar, en su empaque original.\n\nPara iniciar una devolucion, contacte a nuestro equipo de servicio al cliente con su numero de pedido y motivo de devolucion.\n\nLos reembolsos se procesaran dentro de 5-7 dias habiles despues de recibir e inspeccionar los articulos devueltos.\n\nLos gastos de envio de devoluciones son responsabilidad del comprador, a menos que el articulo sea defectuoso.\n\nOfrecemos cambios por diferentes productos o tamanos. Contactenos para coordinar un cambio.\n\nLos productos que han sido abiertos, usados o danados por el cliente no son elegibles para devolucion o reembolso.\n\nPara preguntas sobre devoluciones y reembolsos, contacte a nuestro equipo de servicio al cliente.');

-- ─── page_content（旧表，保持兼容） ───────────────────────
INSERT IGNORE INTO page_content (id, slug, title, title_zh, content, content_zh) VALUES
(1, 'privacy', 'Privacy Policy', '隐私政策',
 'We collect information you provide directly to us. We use the information to provide and improve our services. We do not share your personal information with third parties. We take reasonable measures to protect your information.',
 '我们收集您直接提供给我们的信息。我们使用这些信息来提供和改善我们的服务。我们不会与第三方共享您的个人信息。我们采取合理措施保护您的信息。'),
(2, 'refund', 'Refund & Returns Policy', '退货退款政策',
 'Returns accepted within 30 days. Items must be unused in original packaging. Refunds processed within 5-7 business days. Return shipping at buyer expense unless defective.',
 '商品签收后30天内可退换，商品必须未使用并保持原包装。退款在5-7个工作日内处理。除非商品有缺陷，退货运费由买方承担。');
