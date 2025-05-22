import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProjectById } from "@/lib/actions/project-actions";
import { ProjectForm } from "@/components/projects/project-form";

export const metadata: Metadata = {
  title: "Edit Project | Blurr HR",
  description: "Edit project details",
};

export default async function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  let project;
  
  try {
    const id = (await params).id;
    const response = await getProjectById(id);
    project = response.project;
  } catch {
    notFound();
  }
  
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Edit Project</h1>
      <ProjectForm initialData={project} />
    </div>
  );
} 