use dark_legion_vercel_functions::{catalog_health, load_catalog};

#[tokio::test]
async fn postgres_catalog_and_health_endpoint_use_the_applied_public_snapshot() {
    if std::env::var("DATABASE_URL").is_err() {
        // The ordinary local test suite remains runnable without a database.
        // CI's postgres-integration job sets DATABASE_URL and exercises this path.
        return;
    }

    let (projects, source) = load_catalog()
        .await
        .expect("the SQL snapshot should be readable from PostgreSQL");

    assert_eq!(source, "postgresql");
    assert!(!projects.is_empty());
    assert!(
        projects.iter().all(|project| project.slug != "stale-ci-sentinel"),
        "the SQL snapshot must prune rows that are no longer in the public catalog"
    );

    let health = catalog_health()
        .await
        .expect("the health endpoint should query PostgreSQL");

    assert_eq!(health["status"], "ok");
    assert_eq!(health["catalog_source"], "postgresql");
    assert_eq!(health["catalog_count"].as_u64(), Some(projects.len() as u64));
}
