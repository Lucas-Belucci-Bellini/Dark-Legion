//! Read-only API for the public Dark Legion project catalog.
use axum::{
    extract::{Path, Query, State},
    http::{header, HeaderValue, Method, StatusCode},
    response::{IntoResponse, Response},
    routing::get,
    Json, Router,
};
use serde::{Deserialize, Serialize};
use tower_http::{cors::CorsLayer, trace::TraceLayer};

#[derive(Clone, Debug, Serialize, Deserialize, PartialEq, Eq)]
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
    pub marketing_priority: u8,
}

#[derive(Clone)]
struct AppState {
    projects: Vec<Project>,
}

#[derive(Serialize)]
struct HealthResponse {
    status: &'static str,
    service: &'static str,
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

/// Build the read-only API. Only GET and OPTIONS are exposed.
pub fn app() -> Router {
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
        .with_state(AppState {
            projects: public_projects(),
        })
        .layer(cors)
        .layer(TraceLayer::new_for_http())
}

async fn health() -> Json<HealthResponse> {
    Json(HealthResponse {
        status: "ok",
        service: "dark-legion-api",
    })
}

async fn list_projects(
    State(state): State<AppState>,
    Query(filters): Query<ProjectFilters>,
) -> Json<Vec<Project>> {
    let query = filters.q.as_deref().unwrap_or("").trim().to_lowercase();
    let category = filters
        .category
        .as_deref()
        .unwrap_or("")
        .trim()
        .to_lowercase();

    let mut projects: Vec<Project> = state
        .projects
        .into_iter()
        .filter(|project| {
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
        })
        .collect();

    projects.sort_by(|a, b| {
        b.marketing_priority
            .cmp(&a.marketing_priority)
            .then_with(|| a.name.cmp(&b.name))
    });

    Json(projects)
}

async fn get_project(State(state): State<AppState>, Path(slug): Path<String>) -> Response {
    match state
        .projects
        .into_iter()
        .find(|project| project.slug == slug)
    {
        Some(project) => Json(project).into_response(),
        None => (
            StatusCode::NOT_FOUND,
            Json(ErrorResponse {
                error: "project_not_found",
                message: "Nenhum projeto público corresponde ao identificador informado.",
            }),
        )
            .into_response(),
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
    async fn health_endpoint_returns_ok() {
        let response = request("/health").await;
        assert_eq!(response.status(), StatusCode::OK);

        let body = response.into_body().collect().await.unwrap().to_bytes();
        let json: serde_json::Value = serde_json::from_slice(&body).unwrap();
        assert_eq!(json["status"], "ok");
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
