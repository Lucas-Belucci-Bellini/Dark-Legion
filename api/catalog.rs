use serde_json::Value;
use vercel_runtime::{run, service_fn, Error, Request};

use dark_legion_vercel_functions::load_catalog;

async fn handler(_request: Request) -> Result<Value, Error> {
    let (projects, source) = load_catalog().await?;
    let count = projects.len();
    Ok(serde_json::json!({
        "data": projects,
        "meta": {
            "count": count,
            "source": source,
            "status": if source == "bundled-json-degraded" { "degraded" } else { "ok" },
            "database_status": match source {
                "postgresql" => "connected",
                "bundled-json" => "not-configured",
                _ => "unavailable-or-empty"
            },
            "service": "dark-legion-rust-api"
        }
    }))
}

#[tokio::main]
async fn main() -> Result<(), Error> {
    run(service_fn(handler)).await
}
