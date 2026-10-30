//! Start the Dark Legion HTTP API.
use std::{env, net::SocketAddr};
use tokio::net::TcpListener;
use tracing_subscriber::EnvFilter;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    tracing_subscriber::fmt()
        .with_env_filter(
            EnvFilter::try_from_default_env().unwrap_or_else(|_| EnvFilter::new("info")),
        )
        .init();

    let host = env::var("HOST").unwrap_or_else(|_| "0.0.0.0".to_owned());
    let port = env::var("PORT")
        .unwrap_or_else(|_| "8080".to_owned())
        .parse::<u16>()?;
    let address: SocketAddr = format!("{host}:{port}").parse()?;

    let app = if let Ok(database_url) = env::var("DATABASE_URL") {
        tracing::info!("DATABASE_URL is configured; connecting to PostgreSQL");
        let pool = sqlx::postgres::PgPoolOptions::new()
            .max_connections(10)
            .connect(&database_url)
            .await?;
        sqlx::migrate!("./migrations").run(&pool).await?;
        tracing::info!("PostgreSQL migrations completed; API will read the live catalog");
        dark_legion_api::app_with_database(pool)
    } else {
        tracing::warn!("DATABASE_URL is not configured; using bundled public JSON catalog");
        dark_legion_api::app()
    };

    let listener = TcpListener::bind(address).await?;
    tracing::info!(%address, "Dark Legion API started");
    axum::serve(listener, app).await?;
    Ok(())
}
