import { z } from "zod";

export enum Priority {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
  URGENT = "URGENT",
}

export enum TaskStatus {
  TODO = "TODO",
  IN_PROGRESS = "IN_PROGRESS",
  REVIEW = "REVIEW",
  DONE = "DONE",
}

export const projectSchema = z.object({
  name: z.string().min(1, "Project name is required"),
  description: z.string().optional(),
  organizationId: z.string().min(1, "Organization is required"),
});

export type ProjectFormValues = z.infer<typeof projectSchema>;

export type Project = {
  id: string;
  name: string;
  description?: string;
  organizationId: string;
  createdAt: Date;
  updatedAt: Date;
};

export const taskSchema = z.object({
  title: z.string().min(1, "Task title is required"),
  description: z.string().optional(),
  priority: z.nativeEnum(Priority),
  status: z.nativeEnum(TaskStatus),
  employeeId: z.string().optional(),
  projectId: z.string().min(1, "Project is required"),
});

export type TaskFormValues = z.infer<typeof taskSchema>;

export type Task = {
  id: string;
  title: string;
  description?: string | null;
  priority: Priority;
  status: TaskStatus;
  employeeId?: string;
  projectId: string;
  createdAt: Date;
  updatedAt: Date;
  assignedTo?: {
    id: string;
    name: string;
  } | null;
  project?: {
    id: string;
    name: string;
  };
}; 