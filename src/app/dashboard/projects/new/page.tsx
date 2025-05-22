import { Metadata } from "next";
import { ProjectForm } from "@/components/projects/project-form";

export const metadata: Metadata = {
  title: "Create New Project | Blurr HR",
  description: "Create a new project",
};

export default function NewProjectPage() {
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Create New Project</h1>
      <ProjectForm />
    </div>
  );
} 