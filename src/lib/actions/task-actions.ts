"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { Priority, TaskStatus } from "@/types/project";

interface TaskFilters {
  projectId?: string;
  employeeId?: string;
  status?: TaskStatus;
  priority?: Priority;
}

/**
 * Get tasks with optional filters
 */
export async function getTasks(filters: TaskFilters = {}) {
  try {
    const where: Record<string, unknown> = {};
    
    if (filters.projectId) {
      where.projectId = filters.projectId;
    }
    
    if (filters.employeeId) {
      where.employeeId = filters.employeeId;
    }
    
    if (filters.status) {
      where.status = filters.status;
    }
    
    if (filters.priority) {
      where.priority = filters.priority;
    }
    
    const tasks = await db.task.findMany({
      where,
      include: {
        assignedTo: true,
        project: {
          select: {
            id: true,
            name: true,
          },
      },
      },
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'desc' },
      ],
    });
    
    return { tasks };
  } catch (error) {
    console.error("Failed to fetch tasks:", error);
    throw new Error("Failed to fetch tasks");
  }
}

/**
 * Get a single task by ID
 */
export async function getTaskById(id: string) {
  try {
    const task = await db.task.findUnique({
      where: { id },
      include: {
        assignedTo: true,
        project: true,
      },
    });
    
    if (!task) {
      throw new Error("Task not found");
    }
    
    return { task };
  } catch (error) {
    console.error(`Failed to fetch task with ID ${id}:`, error);
    throw new Error("Failed to fetch task");
  }
}

/**
 * Create a new task
 */
export async function createTask(data: {
  title: string;
  description?: string;
  priority: Priority;
  status: TaskStatus;
  employeeId?: string;
  projectId: string;
}) {
  try {
    const { title, description, priority, status, employeeId, projectId } = data;
    
    // Validate project exists
    const project = await db.project.findUnique({
      where: { id: projectId },
    });
    
    if (!project) {
      throw new Error("Project not found");
    }
    
    // Validate employee exists if provided
    if (employeeId) {
      const employee = await db.employee.findUnique({
        where: { id: employeeId },
      });
      
      if (!employee) {
        throw new Error("Employee not found");
      }
    }
    
    const task = await db.task.create({
      data: {
        title,
        description,
        priority,
        status,
        employeeId,
        projectId,
      },
    });
    
    revalidatePath(`/dashboard/projects/${projectId}`);
    revalidatePath('/dashboard/tasks');
    return { task };
  } catch (error) {
    console.error("Failed to create task:", error);
    if (error instanceof Error) {
      throw new Error(`Failed to create task: ${error.message}`);
    }
    throw new Error("Failed to create task");
  }
}

/**
 * Update an existing task
 */
export async function updateTask(id: string, data: {
  title?: string;
  description?: string;
  priority?: Priority;
  status?: TaskStatus;
  employeeId?: string | null;
  projectId?: string;
}) {
  try {
    const existingTask = await db.task.findUnique({
      where: { id },
    });
    
    if (!existingTask) {
      throw new Error("Task not found");
    }
    
    // Validate project exists if changing
    if (data.projectId && data.projectId !== existingTask.projectId) {
      const project = await db.project.findUnique({
        where: { id: data.projectId },
      });
      
      if (!project) {
        throw new Error("Project not found");
      }
    }
    
    // Validate employee exists if changing and not setting to null
    if (data.employeeId !== undefined && data.employeeId !== null && 
        data.employeeId !== existingTask.employeeId) {
      const employee = await db.employee.findUnique({
        where: { id: data.employeeId },
      });
      
      if (!employee) {
        throw new Error("Employee not found");
      }
    }
    
    const task = await db.task.update({
      where: { id },
      data,
    });
    
    revalidatePath(`/dashboard/tasks/${id}`);
    revalidatePath(`/dashboard/tasks`);
    revalidatePath(`/dashboard/projects/${task.projectId}`);
    
    // If project was changed, revalidate the old project page too
    if (data.projectId && data.projectId !== existingTask.projectId) {
      revalidatePath(`/dashboard/projects/${existingTask.projectId}`);
    }
    
    return { task };
  } catch (error) {
    console.error(`Failed to update task with ID ${id}:`, error);
    if (error instanceof Error) {
      throw new Error(`Failed to update task: ${error.message}`);
    }
    throw new Error("Failed to update task");
  }
}

/**
 * Update just the status of a task (useful for kanban)
 */
export async function updateTaskStatus(id: string, status: TaskStatus) {
  try {
    const task = await db.task.update({
      where: { id },
      data: { status },
    });
    
    revalidatePath(`/dashboard/tasks/${id}`);
    revalidatePath(`/dashboard/tasks`);
    revalidatePath(`/dashboard/projects/${task.projectId}`);
    
    return { task };
  } catch (error) {
    console.error(`Failed to update task status with ID ${id}:`, error);
    throw new Error("Failed to update task status");
  }
}

/**
 * Delete a task
 */
export async function deleteTask(id: string) {
  try {
    const task = await db.task.delete({
      where: { id },
    });
    
    revalidatePath(`/dashboard/tasks`);
    revalidatePath(`/dashboard/projects/${task.projectId}`);
    
    return { success: true };
  } catch (error) {
    console.error(`Failed to delete task with ID ${id}:`, error);
    throw new Error("Failed to delete task");
  }
} 