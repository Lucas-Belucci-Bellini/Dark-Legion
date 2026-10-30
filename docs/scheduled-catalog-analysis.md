# Scheduled public catalog analysis

The two workflows live in this repository:
- `.github/workflows/catalog-analysis-afternoon.yml`: daily at 14:00 BRT (17:00 UTC).
- `.github/workflows/catalog-analysis-midnight.yml`: daily at 00:00 BRT (03:00 UTC).

Both validate `data/public-projects.json`, generate an idempotent PostgreSQL export at `data/public-projects.sql`, and apply it to PostgreSQL when the `DATABASE_URL` repository secret is configured. The generated SQL uses `INSERT ... ON CONFLICT`, so reruns update existing rows rather than duplicating them.

## Live website updates

The Rust API uses SQLx. When its private `DATABASE_URL` environment variable is configured, it reads project records directly from PostgreSQL on each API request. Therefore, once a scheduled Action commits the SQL transaction, the website can show the new data without rebuilding the frontend or restarting the API. The JSON catalog remains a local-development fallback when no database URL is configured.

## Credentials

No manually created GitHub token is required. The workflows use GitHub's automatic `GITHUB_TOKEN` to commit the generated SQL. For the live database, create a PostgreSQL connection string and store it as the repository Actions secret `DATABASE_URL`; also configure the same variable privately in the Rust API hosting service. Never commit the connection string.

If `DATABASE_URL` is absent in Actions, the run still validates and commits the SQL snapshot but skips the live database import. If it is absent in the API service, the API uses bundled JSON and will not show SQL updates until configured.

## Privacy and validation

Only the public catalog file is exported. The analyzer rejects duplicate slugs, malformed entries, non-HTTPS repository URLs, repository URLs outside github.com, non-HTTPS website URLs, and invalid priorities. No private repository metadata is queried or included.
