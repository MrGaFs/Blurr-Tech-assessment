import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTaskById } from "@/lib/actions/task-actions";
import { getProjects } from "@/lib/actions/project-actions";
import { getEmployees } from "@/lib/actions/employee-actions";
import { TaskFormWrapper } from "@/components/tasks/task-form-wrapper";
import { Priority, TaskStatus, Project } from "@/types/project";

export const metadata: Metadata = {
  title: "Edit Task | Blurr HR Portal",
  description: "Edit a task",
};

export default async function EditTaskPage({ params }: { params: { id: string } }) {
  let task;
  
  try {
    // Get the task details
    const taskResponse = await getTaskById(params.id);
    task = taskResponse.task;
    
    // Get all projects and employees for form dropdowns
    const { projects } = await getProjects();
    const { employees } = await getEmployees();

    return (
      <div className="container p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Edit Task</h1>
          <p className="text-muted-foreground">
            Update task details.
          </p>
        </div>

        <div className="border rounded-lg p-6 bg-card">
          <TaskFormWrapper
            taskId={task.id}
            defaultValues={{
              id: task.id,
              title: task.title,
              description: task.description || undefined,
              priority: task.priority as unknown as Priority,
              status: task.status as unknown as TaskStatus,
              employeeId: task.assignedTo?.id || null,
              projectId: task.projectId
            }}
            employees={employees}
            projects={projects as unknown as Project[]}
          />
        </div>
      </div>
    );
  } catch (error) {
    console.error("Failed to load task for editing:", error);
    notFound();
  }
} 