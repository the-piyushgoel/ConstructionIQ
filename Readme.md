# Construction IQ

Production-ready modular monolith for Construction IQ.

Construction IQ provides end-to-end intelligence for construction projects, featuring predictive risk scoring, multi-agent automated reasoning, decision orchestration, and simulation-backed recovery planning.

## Documentation
- [API Documentation](docs/API.md)
- [Architecture Overview](docs/ARCHITECTURE.md)
- [Deployment Guide](docs/DEPLOYMENT.md)

## Quick Start

### 1. Environment Setup
```bash
cp .env.example .env
# Edit .env and supply required credentials
```

### 2. Infrastructure
Start PostgreSQL and Redis:
```bash
docker compose up -d
```

### 3. Application Setup
```bash
cd apps/api
npm install
npm run db:push
npm run dev
```

Server will start on `http://localhost:4000`.

## Developer Workflows
- **Lint:** `npm run lint`
- **Typecheck:** `npm run typecheck`
- **Test:** `npm run test`
- **Build:** `npm run build`

## Release Verification
Please consult `RELEASE_CHECKLIST.md` before approving any production deployments.