# Scheduled public catalog analysis

Dark Legion owns both scheduled workflows:
- .github/workflows/catalog-analysis-afternoon.yml: daily at 14:00 BRT (17:00 UTC).
- .github/workflows/catalog-analysis-midnight.yml: daily at 00:00 BRT (03:00 UTC).

Both run scripts/analyze_catalog.py, validate the public catalog, and generate data/public-projects.sql. The export uses PostgreSQL INSERT ... ON CONFLICT so it can be applied repeatedly without duplicating project rows.

## Current boundary

This phase does not connect to a live PostgreSQL server. The repository currently embeds data/public-projects.json in the Rust API; PostgreSQL/SQLx is not installed in the backend yet. The generated SQL is a versioned database snapshot, not proof that a remote database was updated.

The workflows use the automatically provided GITHUB_TOKEN only to commit the generated SQL in this repository. No personal access token or custom GitHub token needs to be created. GitHub repository settings must allow Actions to write contents; branch protection may also reject direct pushes.

A live database integration is a separate step and requires a PostgreSQL instance and its connection string stored as an Actions secret. Never commit that connection string to the repository.

## Website refresh

A changed SQL snapshot is committed to the Dark Legion repository. That commit can trigger the connected deployment pipeline. The current frontend and Rust API still consume the JSON catalog, however, so the live website does not query this SQL export until the SQLx migration is implemented. data/public-projects.json remains the runtime source of truth in this phase.

## Safety checks

The analyzer rejects duplicate slugs, malformed entries, non-HTTPS repository URLs, non-GitHub repository URLs, non-HTTPS website URLs, and invalid priorities. It only exports the public catalog fields; private repository metadata is not part of the SQL schema.
