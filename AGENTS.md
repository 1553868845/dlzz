# AGENTS.md

## Project Overview

Qing Li Peptide Mall (青利肽商城) — full-stack e-commerce application with public storefront and admin panel. Docker Compose deploys 4 services on CentOS 7: Nginx, Spring Boot backend, MySQL 5.7, and MinIO.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Java 8, Spring Boot 2.7.18, MyBatis 2.3.1, Maven |
| Frontend | React 18, TypeScript 5, Vite 5, Tailwind CSS 3 |
| Database | MySQL 5.7 (schema + seed in `db/`) |
| Storage | MinIO (S3-compatible object storage) |
| Auth | JWT (jjwt 0.11.5), Spring Security |
| Proxy | Nginx (static files + reverse proxy to backend) |
| Deploy | Docker Compose + `deploy.sh` |

## Directory Structure

```
yijianbushu/
├── backend/                  # Spring Boot (Maven)
│   └── src/main/java/com/qingli/mall/
│       ├── config/           # SecurityConfig, CorsConfig, MinioConfig
│       ├── controller/       # REST controllers (admin + public)
│       ├── dto/              # ApiResult<T> unified response wrapper
│       ├── entity/           # JPA-free POJOs mapped by MyBatis
│       ├── mapper/           # MyBatis mapper interfaces + XML in resources/mapper/
│       ├── security/         # JwtUtil, JwtAuthFilter, RateLimitFilter
│       └── service/          # Business services (MinioService, etc.)
├── frontend/                 # React + Vite
│   └── src/
│       ├── admin/            # Admin panel (AuthContext, layout, pages/)
│       ├── api/              # Axios instance + API functions
│       ├── components/       # Shared UI (Navbar, Footer, ProductCard, etc.)
│       ├── context/          # React contexts (WhatsAppContext)
│       ├── i18n/             # Translations (zh/en/es) + LanguageContext
│       ├── pages/            # Public pages (Home, Products, Articles, etc.)
│       └── types/            # TypeScript type definitions
├── db/                       # schema.sql + seed.sql (auto-run on first MySQL start)
├── nginx/                    # nginx.conf reverse proxy config
├── mysql/                    # my.cnf custom MySQL config
├── docker-compose.yml        # 4-service orchestration
├── deploy.sh                 # One-click deploy script for CentOS 7
├── backend.Dockerfile        # Maven build → JRE 8 slim image
├── frontend.Dockerfile       # Node 18 build → nginx serving static files
└── .env                      # Secrets and environment variables
```

## Backend Conventions

- **Package**: `com.qingli.mall`
- **API pattern**: Controllers use `ApiResult<T>` for all responses (success/error wrapping)
- **Auth**: Public endpoints are permitted in `SecurityConfig`. Admin endpoints require JWT via `JwtAuthFilter`. JWT secret set via `APP_JWT_SECRET` env var.
- **Database**: MyBatis mapper XML files live in `resources/mapper/`. No JPA/ORM — raw SQL in XML.
- **File uploads**: Handled by `MinioService`, stored in MinIO bucket. Upload controller returns MinIO URLs.
- **CORS**: Configured via `APP_CORS_ALLOWED_ORIGINS` env var.
- **Lombok**: Used on entities — `@Data`, `@Builder`, etc.

## Frontend Conventions

- **Routing**: `react-router-dom` v6. Admin routes under `/admin/*`, public routes at root.
- **Auth**: Admin auth via `AuthContext` — JWT stored in localStorage, sent as `Authorization: Bearer <token>`.
- **API calls**: Centralized in `src/api/index.ts` using a configured Axios instance.
- **Forms**: `react-hook-form` + `zod` validation.
- **Styling**: Tailwind CSS utility classes. No CSS modules.
- **i18n**: Three locales (zh, en, es) via React context. Translation objects in `src/i18n/`.
- **Admin pages**: Each admin page typically does full CRUD with a modal form, paginated table, confirm delete dialog, and toast notifications.

## Infrastructure

- **MySQL**: Port 3306 bound to localhost only (not exposed publicly). Data persisted in `mysql_data` volume.
- **MinIO**: API on 9000, console on 9001. `images` bucket auto-created on first deploy.
- **Nginx**: Listens on 80/443. Serves frontend static files at `/`, proxies `/api/*` to backend:8080, proxies `/minio-static/*` to minio:9000.
- **Health checks**: All services have Docker health checks. Backend waits for MySQL + MinIO before starting.

## Build & Run

```bash
# Local development
cd frontend && npm run dev        # Vite dev server
cd backend && mvn spring-boot:run # Spring Boot dev server

# Production deploy
bash deploy.sh                    # Full Docker Compose deploy on CentOS 7

# Rebuild after code changes
docker-compose down && docker-compose build --no-cache && docker-compose up -d
```

## Environment Variables (`.env`)

| Variable | Purpose |
|----------|---------|
| `MYSQL_ROOT_PASSWORD` | MySQL root password |
| `MINIO_ACCESS_KEY` | MinIO access key |
| `MINIO_SECRET_KEY` | MinIO secret key |
| `JWT_SECRET` | JWT signing secret (256+ bits) |
| `APP_CORS_ALLOWED_ORIGINS` | Comma-separated allowed CORS origins |
| `FRONTEND_URL` | Public frontend URL for email links, etc. |
