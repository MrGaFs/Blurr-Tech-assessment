import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProjectById } from "@/lib/actions/project-actions";
import { formatDistanceToNow } from "date-fns";

import { Button } from "@/components/ui/button";
import { CircularProgress } from "@/components/ui/circular-progress";
import { ProjectTasksContainer } from "@/components/projects/project-tasks-container";
import { DeleteProjectDialog } from "@/components/projects/delete-project-dialog";
import { CalendarIcon, PencilIcon, PlusIcon } from "lucide-react";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  try {
    const { project } = await getProjectById((await params).id);

    return {
      title: `${project.name} | Blurr HR`,
      description: `Details for project ${project.name}`,
    };
  } catch {
    return {
      title: "Project | Blurr HR",
      description: "Project details",
    };
  }
}

export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  let project;

  try {
    const response = await getProjectById((await params).id);
    project = response.project;
  } catch {
    notFound();
  }

  const totalTasks = project.tasks.length;
  const completedTasks = project.tasks.filter((task) => task.status === "DONE").length;
  const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-start gap-3">
          <CircularProgress 
            value={progressPercentage} 
            size={55} 
            strokeWidth={4} 
            color="#0284c7"
            backgroundColor="#e2e8f0"
            className="mt-2"
          />
          <div>
            <h1 className="text-3xl font-bold">{project.name}</h1>
            <div className="flex items-center text-sm text-muted-foreground mt-1">
              <CalendarIcon className="h-4 w-4 mr-1" />
              Created {formatDistanceToNow(new Date(project.createdAt), { addSuffix: true })}
              <span className="mx-2">·</span>
              <span>{completedTasks} of {totalTasks} tasks completed</span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/dashboard/projects/${project.id}/edit`}>
            <Button variant="outline">
              <PencilIcon className="h-4 w-4 mr-2" />
              Edit Project
            </Button>
          </Link>
          <Link href={`/dashboard/tasks/new?projectId=${project.id}`}>
            <Button>
              <PlusIcon className="h-4 w-4 mr-2" />
              New Task
            </Button>
          </Link>
          <DeleteProjectDialog projectId={project.id} projectName={project.name} />
        </div>
      </div>

      {project.description && (
        <div className="mb-6 text-muted-foreground text-sm">
          <p className="whitespace-pre-line">{project.description}</p>
        </div>
      )}

      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Tasks</h2>
        </div>
        <ProjectTasksContainer 
          tasks={project.tasks} 
          projectId={project.id} 
        />
      </div>
    </div>
  );
} 