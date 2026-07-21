# Deployment Guide

## Prerequisites
- Node.js >= 20.x
- Docker & Docker Compose
- PostgreSQL 16+
- Redis 7+

## Local Development

### 1. Environment Setup
Create a `.env` file in `apps/api` based on `.env.example`:
```bash
cd apps/api
cp .env.example .env
```
Ensure all Required variables (`JWT_SECRET`, `DATABASE_URL`) are populated.

### 2. Database Initialization
Start the local PostgreSQL and Redis instances:
```bash
docker compose up -d
```
Run Prisma migrations to construct the database schema:
```bash
npm run db:push
# or for production migrations: npm run db:migrate
```

### 3. Start the Server
Run the development server with live-reloading:
```bash
npm install
npm run dev
```
The server will be available at `http://localhost:4000/api/v1`.

---

## Docker Deployment

A robust `Dockerfile` exists for production deployment.

### 1. Build the Docker Image
```bash
cd apps/api
docker build -t construction-iq-api .
```

### 2. Run the Container
You must provide required environment variables either via a `.env` file or explicitly:
```bash
docker run -d \
  --name ciq-api \
  -p 4000:4000 \
  --env-file .env \
  construction-iq-api
```

---

## Environment Variables

### Required Variables
- `NODE_ENV`: `development`, `production`, or `test`
- `DATABASE_URL`: PostgreSQL connection string.
- `JWT_SECRET`: Secret key for signing Auth tokens (Crucial for security).

### Infrastructure Settings
- `PORT`: Server port (default: 3000, recommended local: 4000)
- `CORS_ORIGIN`: Allowed origin for API calls (default: `*`)
- `REDIS_URL`: URL for BullMQ caching and background jobs.

### AI Model Settings
- `AI_DEFAULT_PROVIDER`: `openai`, `anthropic`, or `gemini` (default: `openai`)
- `AI_TEMPERATURE`: Sampling temperature for the model (default: `0.7`)
- `AI_MAX_TOKENS`: Token ceiling for response payload (default: `2000`)
- `AI_TIMEOUT_MS`: API connection timeout (default: `30000`)
- `AI_RETRY_COUNT`: Internal AI retry threshold (default: `3`)
- `AI_MODEL_OPENAI`: (default: `gpt-4o`)
- `AI_MODEL_ANTHROPIC`: (default: `claude-3-5-sonnet-20240620`)
- `AI_MODEL_GEMINI`: (default: `gemini-1.5-pro`)

---

## Testing & Verification

Run the verification suite before any deployment:
```bash
# 1. Lint the Codebase
npm run lint

# 2. Typecheck
npm run typecheck

# 3. Unit and Integration Tests
npm run test

# 4. Production Build
npm run build
```
