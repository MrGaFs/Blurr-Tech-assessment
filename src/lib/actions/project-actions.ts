"use server";

import { db } from "@/lib/db";
import { TaskStatus } from "@/types/project";
import { revalidatePath } from "next/cache";

/**
 * Get all projects
 */
export async function getProjects() {
  try {
    const projects = await db.project.findMany({
      include: {
        tasks: true,
      },
      orderBy: {
        name: "asc",
      },
    });
    
    return { projects };
  } catch (error) {
    console.error("Failed to fetch projects:", error);
    throw new Error("Failed to fetch projects");
  }
}

/**
 * Get a single project by id
 */
export async function getProjectById(id: string) {
  try {
    const project = await db.project.findUnique({
      where: { id },
      include: {
        tasks: {
          include: {
            assignedTo: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });
    
    if (!project) {
      throw new Error("Project not found");
    }
    
    return { project };
  } catch (error) {
    console.error(`Failed to fetch project with ID ${id}:`, error);
    throw new Error("Failed to fetch project");
  }
}

/**
 * Create a new project
 */
export async function createProject({ name, description }: { name: string; description?: string }) {
  try {
    const project = await db.project.create({
      data: {
        name,
        description,
      },
    });
    
    revalidatePath('/dashboard/projects');
    return { project };
  } catch (error) {
    console.error("Failed to create project:", error);
    throw new Error("Failed to create project");
  }
}

/**
 * Update an existing project
 */
export async function updateProject({ id, name, description }: { id: string; name: string; description?: string }) {
  try {
    const project = await db.project.update({
      where: { id },
      data: {
        name,
        description,
      },
    });
    
    revalidatePath(`/dashboard/projects/${id}`);
    revalidatePath('/dashboard/projects');
    return { project };
  } catch (error) {
    console.error(`Failed to update project with ID ${id}:`, error);
    throw new Error("Failed to update project");
  }
}

/**
 * Delete a project
 */
export async function deleteProject(id: string) {
  try {
    // First delete all tasks associated with this project
    await db.task.deleteMany({
      where: { projectId: id },
    });
    
    // Then delete the project
    const project = await db.project.delete({
      where: { id },
    });
    
    revalidatePath('/dashboard/projects');
    return { project };
  } catch (error) {
    console.error(`Failed to delete project with ID ${id}:`, error);
    throw new Error("Failed to delete project");
  }
}

/**
 * Get count of tasks by status
 */
export async function getTaskStatusSummary() {
  try {
    const tasks = await db.task.findMany();
    
    // Default all statuses to 0
    const statusCounts = Object.values(TaskStatus).reduce((counts, status) => {
      counts[status] = 0;
      return counts;
    }, {} as Record<string, number>);
    
    // Count tasks by status
    tasks.forEach(task => {
      statusCounts[task.status] = (statusCounts[task.status] || 0) + 1;
    });
    
    return { statusCounts };
  } catch (error) {
    console.error("Failed to fetch task summary:", error);
    throw new Error("Failed to fetch task summary");
  }
} 