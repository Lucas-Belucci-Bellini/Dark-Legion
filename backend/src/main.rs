//! Start the Dark Legion HTTP API.
use std::{env, net::SocketAddr};
use tokio::net::TcpListener;
use tracing_subscriber::EnvFilter;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    tracing_subscriber::fmt()
        .with_env_filter(EnvFilter::try_from_default_env().unwrap_or_else(|_| EnvFilter::new("info")))
        .init();

    // 0.0.0.0 is required by most container platforms; override HOST locally if desired.
    let host = env::var("HOST").unwrap_or_else(|_| "0.0.0.0".to_owned());
    let port = env::var("PORT").unwrap_or_else(|_| "8080".to_owned()).parse::<u16>()?;
    let address: SocketAddr = format!("{host}:{port}").parse()?;
    let listener = TcpListener::bind(address).await?;
    tracing::info!(%address, "Dark Legion API started");
    axum::serve(listener, dark_legion_api::app()).await?;
    Ok(())
}
