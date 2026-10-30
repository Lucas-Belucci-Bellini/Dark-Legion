use serde::{Deserialize, Serialize};
use serde_json::Value;
use sqlx::{postgres::PgPoolOptions, FromRow};
use std::env;
use vercel_runtime::{run, service_fn, Body, Error, Request, Response};

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

    let pool = PgPoolOptions::new()
        .max_connections(5)
        .connect(&database_url)
        .await?;

    let projects = sqlx::query_as::<_, Project>(
        "SELECT slug, name, category, category_label, description, repository_url, website_url, status, featured, marketing_priority FROM public_projects ORDER BY marketing_priority DESC, name ASC",
    )
    .fetch_all(&pool)
    .await?;

    Ok((projects, "postgresql"))
}

async fn handler(_request: Request) -> Result<Response<Body>, Error> {
    let (projects, source) = load_catalog().await?;
    let payload: Value = serde_json::json!({
        "data": projects,
        "meta": {
            "count": projects.len(),
            "source": source,
            "service": "dark-legion-rust-api"
        }
    });

    let body = serde_json::to_vec(&payload)?;
    let response = Response::builder()
        .status(200)
        .header("content-type", "application/json; charset=utf-8")
        .header("cache-control", "no-store, max-age=0")
        .body(Body::from(body))?;

    Ok(response)
}

#[tokio::main]
async fn main() -> Result<(), Error> {
    run(service_fn(handler)).await
}
