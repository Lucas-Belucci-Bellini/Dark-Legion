import type { Metadata } from "next";
import { projects } from "@/data/projects";
import ProjectDetails from "./project-details";

type ProjectPageProps = {
  params: Promise<{ slug: string }>;
};

function findProject(slug: string) {
  return projects.find((project) => project.slug === slug);
}

export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = findProject(slug);

  return {
    title: project ? project.name : "Projeto público | Dark Legion",
    description: project?.description ?? "Explore um projeto público do ecossistema Dark Legion.",
    openGraph: {
      title: project ? `${project.name} | Dark Legion` : "Projeto público | Dark Legion",
      description: project?.description ?? "Diretório público de projetos.",
      type: "article",
    },
  };
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { slug } = await params;
  return <ProjectDetails slug={slug} initialProject={findProject(slug) ?? null} />;
}
