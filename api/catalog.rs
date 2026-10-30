use serde::{Deserialize, Serialize};
use serde_json::Value;
use sqlx::{postgres::PgPoolOptions, FromRow, PgPool};
use std::env;
use tokio::sync::OnceCell;
use vercel_runtime::{run, service_fn, Error, Request};

#[derive(Clone, Debug, Deserialize, Serialize, FromRow)]
struct Project {
    slug: String,
    name: String,
    category: String,
    category_label: String,
    description: String,
    repository_url: String,
    website_url: Option<String>,
    status: String,
    featured: bool,
    marketing_priority: i16,
}

fn bundled_catalog() -> Result<Vec<Project>, Error> {
    Ok(serde_json::from_str(include_str!("../data/public-projects.json"))?)
}

async fn load_catalog() -> Result<(Vec<Project>, &'static str), Error> {
    let Ok(database_url) = env::var("DATABASE_URL") else {
        return Ok((bundled_catalog()?, "bundled-json"));
    };

    static POOL: OnceCell<PgPool> = OnceCell::const_new();
    let pool = POOL
        .get_or_try_init(|| async {
            PgPoolOptions::new()
                .max_connections(5)
                .connect(&database_url)
                .await
        })
        .await?;

    let projects = sqlx::query_as::<_, Project>(
        "SELECT slug, name, category, category_label, description, repository_url, website_url, status, featured, marketing_priority FROM public_projects ORDER BY marketing_priority DESC, name ASC",
    )
    .fetch_all(pool)
    .await?;

    Ok((projects, "postgresql"))
}

async fn handler(_request: Request) -> Result<Value, Error> {
    let (projects, source) = load_catalog().await?;
    let count = projects.len();
    let payload: Value = serde_json::json!({
        "data": projects,
        "meta": {
            "count": count,
            "source": source,
            "service": "dark-legion-rust-api"
        }
    });

    Ok(payload)
}

#[tokio::main]
async fn main() -> Result<(), Error> {
    run(service_fn(handler)).await
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn bundled_catalog_has_unique_slugs_and_https_repositories() {
        let projects = bundled_catalog().expect("bundled catalog must parse");
        let mut slugs: Vec<&str> = projects.iter().map(|project| project.slug.as_str()).collect();
        slugs.sort_unstable();
        slugs.dedup();

        assert_eq!(slugs.len(), projects.len());
        assert!(projects.iter().all(|project| project.repository_url.starts_with("https://github.com/")));
        assert!(projects.iter().all(|project| {
            project.website_url.as_deref().is_none_or(|url| url.starts_with("https://"))
        }));
    }
}
