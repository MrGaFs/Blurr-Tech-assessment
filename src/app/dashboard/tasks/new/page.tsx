import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getProjects } from "@/lib/actions/project-actions";
import { getEmployees } from "@/lib/actions/employee-actions";
import { TaskFormWrapper } from "@/components/tasks/task-form-wrapper";
import { TaskStatus, Project } from "@/types/project";

export const metadata: Metadata = {
  title: "New Task | Blurr HR Portal",
  description: "Create a new task",
};

interface NewTaskPageProps {
  searchParams: Promise<{
    projectId?: string;
    status?: string;
  }>;
}

export default async function NewTaskPage({ searchParams }: NewTaskPageProps) {
  // Get all projects and employees to populate the form dropdowns
  const { projects } = await getProjects();
  const { employees } = await getEmployees();

  if (projects.length === 0) {
    // If there are no projects, we can't create a task
    redirect("/dashboard/projects/new");
  }

  // Set default project ID and status from query params if provided
  const defaultProjectId = (await searchParams)?.projectId || '';
  const defaultStatus = (await searchParams)?.status as TaskStatus | undefined;

  return (
    <div className="container p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Create New Task</h1>
        <p className="text-muted-foreground">
          Add a new task to your project.
        </p>
      </div>

      <div className="border rounded-lg p-6 bg-card">
        <TaskFormWrapper
          defaultValues={{ 
            projectId: defaultProjectId,
            status: defaultStatus,
          }}
          employees={employees}
          projects={projects as unknown as Project[]}
        />
      </div>
    </div>
  );
} 