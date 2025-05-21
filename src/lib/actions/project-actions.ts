"use server";

import { db } from "@/lib/db";
import { TaskStatus } from "@/types/project";

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