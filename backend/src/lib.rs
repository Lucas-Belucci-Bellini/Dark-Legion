//! Rotas e modelos da API pública Dark Legion.
//! O catálogo permanece em memória nesta primeira etapa; PostgreSQL será integrado
//! depois que o contrato HTTP estiver estabilizado.

use axum::{
    extract::{Path, State},
    http::{header, HeaderValue, Method, StatusCode},
    response::{IntoResponse, Response},
    routing::get,
    Json, Router,
};
use serde::{Deserialize, Serialize};
use tower_http::{cors::CorsLayer, trace::TraceLayer};

#[derive(Clone, Debug, Serialize, Deserialize, PartialEq, Eq)]
pub struct Project {
    /// Identificador estável usado nas URLs da API.
    pub slug: String,
    pub name: String,
    pub category: String,
    pub description: String,
    pub repository_url: String,
    pub website_url: String,
    pub status: String,
    pub featured: bool,
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

fn public_projects() -> Vec<Project> {
    // Somente entradas editoriais destinadas ao catálogo público.
    // Confira os links antes do deploy; sua presença aqui não garante disponibilidade.
    vec![
        Project {
            slug: "nexora".into(),
            name: "NEXORA".into(),
            category: "Engine e jogos".into(),
            description: "Projeto experimental de engine e ecossistema de desenvolvimento de jogos.".into(),
            repository_url: "https://github.com/Lucas-Belucci-Bellini/NEXORA".into(),
            website_url: "https://web-2qfw.vercel.app".into(),
            status: "Em desenvolvimento".into(),
            featured: true,
        },
        Project {
            slug: "project-vanguard".into(),
            name: "Project Vanguard".into(),
            category: "Ecossistema de software".into(),
            description: "Projeto de software independente em evolução.".into(),
            repository_url: "https://github.com/Lucas-Belucci-Bellini/Project-Vanguard".into(),
            website_url: "https://project-vanguard-cyan.vercel.app".into(),
            status: "Em desenvolvimento".into(),
            featured: true,
        },
        Project {
            slug: "codevibe-academy".into(),
            name: "CodeVibe Academy".into(),
            category: "Educação e web".into(),
            description: "Experiência web voltada a conteúdo e aprendizado de programação.".into(),
            repository_url: "https://github.com/Lucas-Belucci-Bellini/CodeVibe-Academy".into(),
            website_url: "https://code-vibe-academy.vercel.app".into(),
            status: "Em desenvolvimento".into(),
            featured: false,
        },
        Project {
            slug: "dailyplanner".into(),
            name: "DailyPlanner".into(),
            category: "Produtividade".into(),
            description: "Aplicação de planejamento diário para organizar tarefas e atividades.".into(),
            repository_url: "https://github.com/Lucas-Belucci-Bellini/DailyPlanner".into(),
            website_url: "https://daily-planner-phi-smoky.vercel.app".into(),
            status: "Em desenvolvimento".into(),
            featured: false,
        },
        Project {
            slug: "veritas".into(),
            name: "Veritas".into(),
            category: "Ferramentas e hardware".into(),
            description: "Projeto experimental de software e ferramentas técnicas.".into(),
            repository_url: "https://github.com/Lucas-Belucci-Bellini/Veritas".into(),
            website_url: "https://veritas-opal-seven.vercel.app".into(),
            status: "Experimental".into(),
            featured: false,
        },
        Project {
            slug: "baluarte-obra-segura".into(),
            name: "Baluarte Obra Segura".into(),
            category: "Construção e segurança".into(),
            description: "Projeto web relacionado a processos e segurança em obras.".into(),
            repository_url: "https://github.com/Lucas-Belucci-Bellini/baluarte-obra-segura".into(),
            website_url: "https://baluarte-obra-segura.vercel.app".into(),
            status: "Em desenvolvimento".into(),
            featured: false,
        },
        Project {
            slug: "llbr-innovations-constructions".into(),
            name: "LLBR Innovations Constructions".into(),
            category: "Construção e web".into(),
            description: "Presença digital para uma iniciativa de construção e inovação.".into(),
            repository_url: "https://github.com/Lucas-Belucci-Bellini/LLBR-Innovations-Constructions".into(),
            website_url: "https://llbr-innovations-constructions.vercel.app".into(),
            status: "Em desenvolvimento".into(),
            featured: false,
        },
        Project {
            slug: "portfolio-baluarte".into(),
            name: "Portfólio Baluarte".into(),
            category: "Ecossistema Baluarte".into(),
            description: "Site de apresentação de projetos associados ao ecossistema Baluarte.".into(),
            repository_url: "https://github.com/Lucas-Belucci-Bellini/Portifolio-Baluarte-Lucas-Belucci-Bellini-".into(),
            website_url: "https://portifolio-baluarte-lucas-belucci-b.vercel.app".into(),
            status: "Em desenvolvimento".into(),
            featured: false,
        },
        Project {
            slug: "baluarte-world-game".into(),
            name: "Baluarte World Game".into(),
            category: "Jogos".into(),
            description: "Projeto de jogo ligado ao universo de projetos Baluarte.".into(),
            repository_url: "https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte-World-Game".into(),
            website_url: "https://projeto-baluarte-world-game.vercel.app".into(),
            status: "Em desenvolvimento".into(),
            featured: false,
        },
    ]
}

/// Monta a aplicação. A origem permitida pode ser configurada com FRONTEND_ORIGIN.
pub fn app() -> Router {
    let frontend_origin = std::env::var("FRONTEND_ORIGIN")
        .unwrap_or_else(|_| "http://localhost:3000".to_owned());
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
        .with_state(AppState { projects: public_projects() })
        .layer(cors)
        .layer(TraceLayer::new_for_http())
}

async fn health() -> Json<HealthResponse> {
    Json(HealthResponse {
        status: "ok",
        service: "dark-legion-api",
    })
}

async fn list_projects(State(state): State<AppState>) -> Json<Vec<Project>> {
    Json(state.projects)
}

async fn get_project(
    State(state): State<AppState>,
    Path(slug): Path<String>,
) -> Response {
    match state.projects.into_iter().find(|project| project.slug == slug) {
        Some(project) => Json(project).into_response(),
        None => (
            StatusCode::NOT_FOUND,
            Json(ErrorResponse {
                error: "project_not_found",
                message: "Nenhum projeto público corresponde ao identificador informado.",
            }),
        ).into_response(),
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use axum::{body::Body, http::Request};
    use http_body_util::BodyExt;
    use tower::ServiceExt;

    #[tokio::test]
    async fn health_endpoint_returns_ok() {
        let response = app().oneshot(
            Request::builder().uri("/health").body(Body::empty()).unwrap()
        ).await.unwrap();

        assert_eq!(response.status(), StatusCode::OK);
        let body = response.into_body().collect().await.unwrap().to_bytes();
        let json: serde_json::Value = serde_json::from_slice(&body).unwrap();
        assert_eq!(json["status"], "ok");
        assert_eq!(json["service"], "dark-legion-api");
    }

    #[tokio::test]
    async fn list_projects_returns_public_catalog() {
        let response = app().oneshot(
            Request::builder().uri("/api/v1/projects").body(Body::empty()).unwrap()
        ).await.unwrap();

        assert_eq!(response.status(), StatusCode::OK);
        let body = response.into_body().collect().await.unwrap().to_bytes();
        let projects: Vec<Project> = serde_json::from_slice(&body).unwrap();
        assert_eq!(projects.len(), 9);
        assert!(projects.iter().all(|project| !project.repository_url.is_empty() && !project.website_url.is_empty()));
    }

    #[tokio::test]
    async fn project_detail_returns_matching_slug() {
        let response = app().oneshot(
            Request::builder().uri("/api/v1/projects/nexora").body(Body::empty()).unwrap()
        ).await.unwrap();

        assert_eq!(response.status(), StatusCode::OK);
        let body = response.into_body().collect().await.unwrap().to_bytes();
        let project: Project = serde_json::from_slice(&body).unwrap();
        assert_eq!(project.slug, "nexora");
        assert_eq!(project.name, "NEXORA");
    }

    #[tokio::test]
    async fn unknown_project_returns_404() {
        let response = app().oneshot(
            Request::builder().uri("/api/v1/projects/not-a-public-project").body(Body::empty()).unwrap()
        ).await.unwrap();

        assert_eq!(response.status(), StatusCode::NOT_FOUND);
    }
}
