//! Shared data access for the Dark Legion Vercel Rust Functions.
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};
use sqlx::{postgres::PgPoolOptions, FromRow, PgPool};
use std::{env, time::Duration};
use tokio::sync::OnceCell;
use vercel_runtime::Error;

#[derive(Clone, Debug, Deserialize, Serialize, FromRow)]
pub struct Project {
    pub slug: String,
    pub name: String,
    pub category: String,
    pub category_label: String,
    pub description: String,
    pub repository_url: String,
    pub website_url: Option<String>,
    pub status: String,
    pub featured: bool,
    pub marketing_priority: i16,
}

static DATABASE_POOL: OnceCell<PgPool> = OnceCell::const_new();

pub fn bundled_catalog() -> Result<Vec<Project>, Error> {
    Ok(serde_json::from_str(include_str!(
        "../data/public-projects.json"
    ))?)
}

async fn database_pool() -> Result<Option<&'static PgPool>, Error> {
    let Ok(database_url) = env::var("DATABASE_URL") else {
        return Ok(None);
    };

    let pool = DATABASE_POOL
        .get_or_try_init(|| async {
            PgPoolOptions::new()
                // Keep serverless connection fan-out modest. Use a provider's
                // pooled connection URL when the database offers one.
                .max_connections(2)
                .acquire_timeout(Duration::from_secs(5))
                .idle_timeout(Some(Duration::from_secs(30)))
                .max_lifetime(Some(Duration::from_secs(300)))
                .connect(&database_url)
                .await
        })
        .await?;

    Ok(Some(pool))
}

pub async fn load_catalog() -> Result<(Vec<Project>, &'static str), Error> {
    let pool = match database_pool().await {
        Ok(Some(pool)) => pool,
        Ok(None) => return Ok((bundled_catalog()?, "bundled-json")),
        Err(_) => {
            eprintln!("PostgreSQL connection unavailable; serving bundled catalog.");
            return Ok((bundled_catalog()?, "bundled-json-degraded"));
        }
    };

    let query = sqlx::query_as::<_, Project>(
        "SELECT slug, name, category, category_label, description, repository_url, website_url, status, featured, marketing_priority FROM public_projects ORDER BY marketing_priority DESC, name ASC",
    )
    .fetch_all(pool)
    .await;

    match query {
        Ok(projects) if !projects.is_empty() => Ok((projects, "postgresql")),
        Ok(_) => {
            eprintln!("PostgreSQL catalog is empty; serving bundled catalog.");
            Ok((bundled_catalog()?, "bundled-json-degraded"))
        }
        Err(_) => {
            eprintln!("PostgreSQL catalog query failed; serving bundled catalog.");
            Ok((bundled_catalog()?, "bundled-json-degraded"))
        }
    }
}

fn health_payload(
    status: &'static str,
    source: &'static str,
    database_status: &'static str,
    count: usize,
) -> Value {
    json!({
        "status": status,
        "service": "dark-legion-rust-api",
        "catalog_source": source,
        "database_status": database_status,
        "catalog_count": count
    })
}

pub async fn catalog_health() -> Result<Value, Error> {
    let (projects, source) = load_catalog().await?;
    let (status, database_status) = match source {
        "postgresql" => ("ok", "connected"),
        "bundled-json" => ("ok", "not-configured"),
        _ => ("degraded", "unavailable-or-empty"),
    };

    Ok(health_payload(
        status,
        source,
        database_status,
        projects.len(),
    ))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn bundled_catalog_has_unique_slugs_and_safe_urls() {
        let projects = bundled_catalog().expect("bundled catalog must parse");
        let mut slugs: Vec<&str> = projects
            .iter()
            .map(|project| project.slug.as_str())
            .collect();
        slugs.sort_unstable();
        slugs.dedup();

        assert_eq!(slugs.len(), projects.len());
        assert!(!projects.is_empty());
        assert!(projects
            .iter()
            .all(|project| project.repository_url.starts_with("https://github.com/")));
        assert!(projects.iter().all(|project| {
            project
                .website_url
                .as_deref()
                .is_none_or(|url| url.starts_with("https://"))
        }));
    }

    #[test]
    fn degraded_health_payload_reports_database_fallback() {
        let payload = health_payload(
            "degraded",
            "bundled-json-degraded",
            "unavailable-or-empty",
            78,
        );
        assert_eq!(payload["status"], "degraded");
        assert_eq!(payload["catalog_source"], "bundled-json-degraded");
        assert_eq!(payload["database_status"], "unavailable-or-empty");
        assert_eq!(payload["catalog_count"], 78);
    }

    #[test]
    fn health_payload_reports_source_and_catalog_count() {
        let payload = health_payload("ok", "bundled-json", "not-configured", 78);
        assert_eq!(payload["status"], "ok");
        assert_eq!(payload["catalog_source"], "bundled-json");
        assert_eq!(payload["database_status"], "not-configured");
        assert_eq!(payload["catalog_count"], 78);
    }
}
