# M-CORE

Next.js + Prisma + Supabase application.

## Getting Started

```bash
npm ci
npm run dev
```

Open http://localhost:3000 in your browser.

## Quality Checks

```bash
npx prisma generate
npx prisma validate
npm run type-check
npm run lint
npm test
npm run build
git diff --check
```

## Production Deployment on Vercel

Production deployment is controlled by `.github/workflows/production-deploy.yml`. The workflow runs quality gates, applies Prisma migrations through CI, deploys to Vercel Production, and checks `/api/v1/health`.

Configure these values only in GitHub Actions/Vercel secret or environment settings; never commit them:

- `PRODUCTION_DIRECT_URL` secret for the Supabase production migration connection.
- `VERCEL_TOKEN`, `VERCEL_ORG_ID`, and `VERCEL_PROJECT_ID` secrets.
- `PRODUCTION_URL` environment variable for the health check.
- Application runtime variables from `.env.example` in Vercel Production Environment.

Before release:

1. Validate migration/schema changes against a separate staging Supabase database.
2. Confirm a production backup or restore point and rollback owner/window.
3. Confirm all quality gates pass on the release commit.
4. Trigger the workflow manually with `DEPLOY_PRODUCTION`, or push an approved `v*` tag.
5. CI runs `prisma migrate deploy` before `vercel deploy --prod`.
6. Verify health and authenticated smoke without exposing credentials.

Do not use `prisma db push`, reset, or manual production SQL. Use migration files under `prisma/migrations` and the CI migration step only. Custom domains and DNS changes remain deferred.
