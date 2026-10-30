//! Read-only public project API backed by PostgreSQL when DATABASE_URL is configured.
use axum::{
    extract::{Path, Query, State},
    http::{header, HeaderValue, Method, StatusCode},
    response::{IntoResponse, Response},
    routing::get,
    Json, Router,
};
use serde::{Deserialize, Serialize};
use sqlx::PgPool;
use tower_http::{cors::CorsLayer, trace::TraceLayer};

#[derive(Clone, Debug, Serialize, Deserialize, PartialEq, Eq, sqlx::FromRow)]
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

#[derive(Clone)]
struct AppState {
    database: Option<PgPool>,
    fallback_projects: Vec<Project>,
}

#[derive(Serialize)]
struct HealthResponse {
    status: &'static str,
    service: &'static str,
    catalog_source: &'static str,
}

#[derive(Serialize)]
struct ErrorResponse {
    error: &'static str,
    message: &'static str,
}

#[derive(Debug, Default, Deserialize)]
struct ProjectFilters {
    q: Option<String>,
    category: Option<String>,
    featured: Option<bool>,
}

fn public_projects() -> Vec<Project> {
    serde_json::from_str(include_str!("../../data/public-projects.json"))
        .expect("data/public-projects.json must contain a valid public catalog")
}

fn build_router(state: AppState) -> Router {
    let frontend_origin =
        std::env::var("FRONTEND_ORIGIN").unwrap_or_else(|_| "http://localhost:3000".to_owned());
    let origin = frontend_origin
        .parse::<HeaderValue>()
        .unwrap_or_else(|_| HeaderValue::from_static("http://localhost:3000"));
    let cors = CorsLayer::new()
        .allow_origin(origin)
        .allow_methods([Method::GET, Method::OPTIONS])
        .allow_headers([header::CONTENT_TYPE]);

    Router::new()
        .route("/health", get(health))
        .route("/api/v1/projects", get(list_projects))
        .route("/api/v1/projects/{slug}", get(get_project))
        .with_state(state)
        .layer(cors)
        .layer(TraceLayer::new_for_http())
}

/// Build the API with the bundled public JSON catalog (local development fallback).
pub fn app() -> Router {
    build_router(AppState {
        database: None,
        fallback_projects: public_projects(),
    })
}

/// Build the API with PostgreSQL as the live source of truth.
pub fn app_with_database(pool: PgPool) -> Router {
    build_router(AppState {
        database: Some(pool),
        fallback_projects: Vec::new(),
    })
}

impl AppState {
    async fn all_projects(&self) -> Result<Vec<Project>, sqlx::Error> {
        match &self.database {
            Some(pool) => {
                sqlx::query_as::<_, Project>(
                    "SELECT slug, name, category, category_label, description, repository_url, website_url, status, featured, marketing_priority FROM public_projects ORDER BY marketing_priority DESC, name ASC",
                )
                .fetch_all(pool)
                .await
            }
            None => Ok(self.fallback_projects.clone()),
        }
    }

    async fn find_project(&self, slug: &str) -> Result<Option<Project>, sqlx::Error> {
        match &self.database {
            Some(pool) => {
                sqlx::query_as::<_, Project>(
                    "SELECT slug, name, category, category_label, description, repository_url, website_url, status, featured, marketing_priority FROM public_projects WHERE slug = $1",
                )
                .bind(slug)
                .fetch_optional(pool)
                .await
            }
            None => Ok(self
                .fallback_projects
                .iter()
                .find(|project| project.slug == slug)
                .cloned()),
        }
    }
}

async fn health(State(state): State<AppState>) -> Json<HealthResponse> {
    Json(HealthResponse {
        status: "ok",
        service: "dark-legion-api",
        catalog_source: if state.database.is_some() {
            "postgresql"
        } else {
            "bundled-json"
        },
    })
}

async fn list_projects(
    State(state): State<AppState>,
    Query(filters): Query<ProjectFilters>,
) -> Result<Json<Vec<Project>>, (StatusCode, Json<ErrorResponse>)> {
    let mut projects = state.all_projects().await.map_err(|error| {
        tracing::error!(%error, "Could not load public projects from PostgreSQL");
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(ErrorResponse {
                error: "catalog_unavailable",
                message: "O catálogo de projetos está temporariamente indisponível.",
            }),
        )
    })?;

    let query = filters.q.as_deref().unwrap_or("").trim().to_lowercase();
    let category = filters
        .category
        .as_deref()
        .unwrap_or("")
        .trim()
        .to_lowercase();

    projects.retain(|project| {
        let matches_query = query.is_empty()
            || project.name.to_lowercase().contains(&query)
            || project.slug.to_lowercase().contains(&query)
            || project.description.to_lowercase().contains(&query)
            || project.category.to_lowercase().contains(&query)
            || project.category_label.to_lowercase().contains(&query);
        let matches_category = category.is_empty()
            || project.category.to_lowercase() == category
            || project.category_label.to_lowercase() == category;
        let matches_featured = filters
            .featured
            .is_none_or(|value| project.featured == value);
        matches_query && matches_category && matches_featured
    });

    projects.sort_by(|a, b| {
        b.marketing_priority
            .cmp(&a.marketing_priority)
            .then_with(|| a.name.cmp(&b.name))
    });

    Ok(Json(projects))
}

async fn get_project(State(state): State<AppState>, Path(slug): Path<String>) -> Response {
    match state.find_project(&slug).await {
        Ok(Some(project)) => Json(project).into_response(),
        Ok(None) => (
            StatusCode::NOT_FOUND,
            Json(ErrorResponse {
                error: "project_not_found",
                message: "Nenhum projeto público corresponde ao identificador informado.",
            }),
        )
            .into_response(),
        Err(error) => {
            tracing::error!(%error, %slug, "Could not load public project from PostgreSQL");
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(ErrorResponse {
                    error: "catalog_unavailable",
                    message: "O catálogo de projetos está temporariamente indisponível.",
                }),
            )
                .into_response()
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use axum::{body::Body, http::Request};
    use http_body_util::BodyExt;
    use tower::ServiceExt;

    async fn request(uri: &str) -> Response {
        app()
            .oneshot(Request::builder().uri(uri).body(Body::empty()).unwrap())
            .await
            .unwrap()
    }

    #[tokio::test]
    async fn health_endpoint_reports_json_fallback() {
        let response = request("/health").await;
        assert_eq!(response.status(), StatusCode::OK);
        let body = response.into_body().collect().await.unwrap().to_bytes();
        let json: serde_json::Value = serde_json::from_slice(&body).unwrap();
        assert_eq!(json["status"], "ok");
        assert_eq!(json["catalog_source"], "bundled-json");
    }

    #[tokio::test]
    async fn list_contains_public_catalog_and_optional_websites() {
        let response = request("/api/v1/projects").await;
        assert_eq!(response.status(), StatusCode::OK);
        let body = response.into_body().collect().await.unwrap().to_bytes();
        let projects: Vec<Project> = serde_json::from_slice(&body).unwrap();
        assert!(projects.len() >= 70);
        assert!(projects
            .iter()
            .all(|project| project.repository_url.starts_with("https://github.com/")));
        assert!(projects
            .iter()
            .filter_map(|project| project.website_url.as_ref())
            .all(|url| url.starts_with("https://")));
    }

    #[tokio::test]
    async fn query_filter_finds_project() {
        let response = request("/api/v1/projects?q=nexora").await;
        let body = response.into_body().collect().await.unwrap().to_bytes();
        let projects: Vec<Project> = serde_json::from_slice(&body).unwrap();
        assert!(projects.iter().any(|project| project.slug == "nexora"));
        assert!(projects.iter().all(|project| {
            project.name.to_lowercase().contains("nexora")
                || project.slug.to_lowercase().contains("nexora")
                || project.description.to_lowercase().contains("nexora")
                || project.category.to_lowercase().contains("nexora")
                || project.category_label.to_lowercase().contains("nexora")
        }));
    }

    #[tokio::test]
    async fn featured_filter_returns_only_featured_projects() {
        let response = request("/api/v1/projects?featured=true").await;
        assert_eq!(response.status(), StatusCode::OK);
        let body = response.into_body().collect().await.unwrap().to_bytes();
        let projects: Vec<Project> = serde_json::from_slice(&body).unwrap();
        assert!(!projects.is_empty());
        assert!(projects.iter().all(|project| project.featured));
    }

    #[tokio::test]
    async fn category_filter_matches_category_label() {
        let response = request("/api/v1/projects?category=Games").await;
        assert_eq!(response.status(), StatusCode::OK);
        let body = response.into_body().collect().await.unwrap().to_bytes();
        let projects: Vec<Project> = serde_json::from_slice(&body).unwrap();
        assert!(!projects.is_empty());
        assert!(projects.iter().all(|project| {
            project.category.to_lowercase() == "games"
                || project.category_label.to_lowercase() == "games"
        }));
    }

    #[tokio::test]
    async fn catalog_contains_unique_slugs() {
        let projects = public_projects();
        let mut slugs: Vec<&str> = projects
            .iter()
            .map(|project| project.slug.as_str())
            .collect();
        slugs.sort_unstable();
        slugs.dedup();
        assert_eq!(slugs.len(), projects.len());
    }

    #[tokio::test]
    async fn project_detail_returns_matching_slug() {
        let response = request("/api/v1/projects/nexora").await;
        assert_eq!(response.status(), StatusCode::OK);
        let body = response.into_body().collect().await.unwrap().to_bytes();
        let project: Project = serde_json::from_slice(&body).unwrap();
        assert_eq!(project.slug, "nexora");
    }

    #[tokio::test]
    async fn unknown_project_returns_404() {
        let response = request("/api/v1/projects/not-public").await;
        assert_eq!(response.status(), StatusCode::NOT_FOUND);
    }
}
