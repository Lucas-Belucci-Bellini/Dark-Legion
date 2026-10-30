#!/usr/bin/env python3
"""Discover only publicly visible repositories owned by the configured GitHub user."""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "data" / "public-projects.json"
USERNAME = "Lucas-Belucci-Bellini"
API = "https://api.github.com"
PER_PAGE = 100


def request_json(url: str) -> object:
    request = Request(
        url,
        headers={
            "Accept": "application/vnd.github+json",
            "User-Agent": "Dark-Legion-Public-Catalog/1.0",
            "X-GitHub-Api-Version": "2022-11-28",
        },
    )
    try:
        with urlopen(request, timeout=20) as response:
            return json.loads(response.read().decode("utf-8"))
    except HTTPError as error:
        if error.code in (403, 429):
            reset = error.headers.get("X-RateLimit-Reset", "unknown")
            raise RuntimeError(
                f"GitHub API rate limit reached (HTTP {error.code}); reset epoch: {reset}"
            ) from error
        raise RuntimeError(f"GitHub API returned HTTP {error.code} for {url}") from error
    except (URLError, TimeoutError) as error:
        raise RuntimeError(f"Could not reach GitHub API: {error}") from error


def fetch_public_repositories() -> list[dict]:
    repositories: list[dict] = []
    page = 1
    while True:
        query = urlencode({"type": "owner", "per_page": PER_PAGE, "page": page, "sort": "updated"})
        payload = request_json(f"{API}/users/{USERNAME}/repos?{query}")
        if not isinstance(payload, list):
            raise RuntimeError("GitHub API returned an unexpected repository-list response")
        if not payload:
            break
        for repository in payload:
            if not isinstance(repository, dict):
                continue
            owner = repository.get("owner") or {}
            # The public users/repos endpoint returns public repositories only.
            # Keep this explicit guard so a future API/auth change cannot leak private entries.
            if (
                owner.get("login", "").casefold() == USERNAME.casefold()
                and repository.get("private") is False
                and isinstance(repository.get("name"), str)
            ):
                repositories.append(repository)
        if len(payload) < PER_PAGE:
            break
        page += 1
    return repositories


def slugify(name: str) -> str:
    slug = re.sub(r"[^a-z0-9]+", "-", name.casefold()).strip("-")
    if not slug or not re.fullmatch(r"[a-z0-9]+(?:-[a-z0-9]+)*", slug):
        raise ValueError(f"Could not create a safe catalog slug for repository: {name}")
    return slug


def safe_homepage(value: object) -> str | None:
    if not isinstance(value, str) or not value.strip():
        return None
    value = value.strip()
    return value if value.startswith("https://") else None


def classify(language: object) -> tuple[str, str]:
    categories = {
        "Rust": ("Engenharia & Sistemas", "Rust / Sistemas"),
        "TypeScript": ("Web & SaaS", "TypeScript / Aplicações Web"),
        "JavaScript": ("Web & SaaS", "JavaScript / Aplicações Web"),
        "Python": ("IA & Automação", "Python / Automação"),
        "Java": ("Software & Educação", "Java / Software"),
        "C#": ("Engines & Games", "C# / Desenvolvimento de Jogos"),
        "C++": ("Engines & Games", "C++ / Sistemas e Jogos"),
        "Kotlin": ("Software & Mobile", "Kotlin / Aplicações"),
        "HTML": ("Web & SaaS", "HTML / Web"),
        "Go": ("Engenharia & Sistemas", "Go / Sistemas"),
    }
    return categories.get(language, ("Software & Ferramentas", "Projetos e Ferramentas"))


def discover_catalog(existing: list[dict], repositories: list[dict]) -> list[dict]:
    public_by_name = {
        repository["name"].casefold(): repository
        for repository in repositories
        if repository.get("private") is False
        and (repository.get("owner") or {}).get("login", "").casefold() == USERNAME.casefold()
    }

    # Remove stale entries for this owner if the repository is no longer public.
    retained: list[dict] = []
    for project in existing:
        url = project.get("repository_url", "")
        match = re.fullmatch(r"https://github\.com/([^/]+)/([^/]+)/?", url)
        if match and match.group(1).casefold() == USERNAME.casefold():
            if match.group(2).casefold() not in public_by_name:
                continue
        retained.append(project)

    by_repo_name: dict[str, dict] = {}
    for project in retained:
        url = project.get("repository_url", "")
        match = re.fullmatch(r"https://github\.com/([^/]+)/([^/]+)/?", url)
        if match and match.group(1).casefold() == USERNAME.casefold():
            by_repo_name[match.group(2).casefold()] = project

    used_slugs = {project["slug"] for project in retained}
    result = list(retained)
    added = 0
    refreshed = 0

    for repository in sorted(public_by_name.values(), key=lambda item: item["name"].casefold()):
        name = repository["name"]
        key = name.casefold()
        homepage = safe_homepage(repository.get("homepage"))
        existing_project = by_repo_name.get(key)
        if existing_project is not None:
            # Keep hand-curated copy, featured state, category and priority.
            if existing_project.get("website_url") is None and homepage:
                existing_project["website_url"] = homepage
                refreshed += 1
            if repository.get("archived") and existing_project.get("status") == "Ativo":
                existing_project["status"] = "Arquivado"
                refreshed += 1
            continue

        slug = slugify(name)
        if slug in used_slugs:
            raise RuntimeError(f"Slug collision while discovering repository {name!r}: {slug!r}")
        category, category_label = classify(repository.get("language"))
        description = repository.get("description")
        if not isinstance(description, str) or not description.strip():
            description = "Projeto público sem descrição informada."
        result.append(
            {
                "slug": slug,
                "name": name,
                "category": category,
                "category_label": category_label,
                "description": description.strip(),
                "repository_url": f"https://github.com/{USERNAME}/{name}",
                "website_url": homepage,
                "status": "Arquivado" if repository.get("archived") else "Público",
                "featured": False,
                "marketing_priority": 0,
            }
        )
        used_slugs.add(slug)
        added += 1

    result.sort(key=lambda project: (-project["marketing_priority"], project["name"].casefold()))
    print(
        f"Discovered {len(public_by_name)} public repositories; "
        f"added {added}, refreshed {refreshed}, catalog total {len(result)}."
    )
    return result


def main() -> None:
    existing = json.loads(SOURCE.read_text(encoding="utf-8"))
    if not isinstance(existing, list):
        raise RuntimeError("Existing catalog must be a JSON array")
    repositories = fetch_public_repositories()
    updated = discover_catalog(existing, repositories)
    SOURCE.write_text(
        json.dumps(updated, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )


if __name__ == "__main__":
    try:
        main()
    except (RuntimeError, ValueError, json.JSONDecodeError) as error:
        print(f"Catalog discovery failed safely: {error}", file=sys.stderr)
        raise SystemExit(1)
