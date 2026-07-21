# Release Checklist

Ensure the following items are completed before signing off on any production release of Construction IQ.

## 1. Code Quality & Formatting
- [ ] `npm run lint` passes without errors.
- [ ] Code follows project style guidelines and naming conventions.
- [ ] No temporary `TODO:` or `FIXME:` comments left in critical execution paths.

## 2. Type Safety
- [ ] `npm run typecheck` passes without errors.
- [ ] No new `any` casts introduced unless absolutely necessary and documented.

## 3. Testing
- [ ] `npm run test` passes with 100% success rate.
- [ ] New endpoints and services have corresponding unit and integration tests.
- [ ] Core paths (`/api/v1/intelligence/full`) tested against Edge cases (e.g., missing configurations).

## 4. Build Verification
- [ ] `npm run build` succeeds.
- [ ] Compiled JavaScript output (`dist/` or `build/`) is properly generated.

## 5. Environment Verification
- [ ] `.env.example` is fully up to date with new variables introduced in the release.
- [ ] `src/config/env.ts` properly validates all required variables using Zod.
- [ ] Missing variables correctly trigger a startup crash with clear console errors, instead of silent failures.

## 6. Docker Verification
- [ ] `docker build -t construction-iq-api .` succeeds.
- [ ] Running the container locally succeeds.
- [ ] Database migrations execute correctly inside the Docker container lifecycle.

## 7. API Verification
- [ ] API Documentation (`docs/API.md`) is up to date with all payload changes.
- [ ] Postman Collection (`ConstructionIQ.postman_collection.json`) is updated.
- [ ] Standardized API error responses (e.g. `400 Bad Request` with `VALIDATION_ERROR` codes) are respected for new endpoints.

## 8. Deployment Verification
- [ ] Architecture documentation (`docs/ARCHITECTURE.md`) reflects any structural changes.
- [ ] Database schema changes (`prisma/schema.prisma`) have corresponding migration files.
- [ ] Deployment guides are accurate and accessible.
