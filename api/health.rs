use serde_json::Value;
use vercel_runtime::{run, service_fn, Error, Request};

use dark_legion_vercel_functions::catalog_health;

async fn handler(_request: Request) -> Result<Value, Error> {
    catalog_health().await
}

#[tokio::main]
async fn main() -> Result<(), Error> {
    run(service_fn(handler)).await
}
