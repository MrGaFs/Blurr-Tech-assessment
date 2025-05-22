'use client';

import { useState, useEffect } from "react";
import { TaskList } from "@/components/projects/task-list";
import { ProjectKanban } from "@/components/projects/project-kanban";
import { ViewToggle } from "@/components/projects/view-toggle";
import { TaskStatus, Priority, Task } from "@/types/project";
import { saveProjectViewPreference, getProjectViewPreference } from "@/lib/utils/storage";

interface Employee {
  id: string;
  name: string;
}

// This is the type the component actually receives from Prisma
interface PrismaTask {
  id: string;
  title: string;
  description?: string | null;
  status: string; // Coming from Prisma as string
  priority: string; // Coming from Prisma as string
  projectId: string;
  createdAt: Date;
  updatedAt: Date;
  assignedTo?: Employee | null;
}

interface ProjectTasksContainerProps {
  tasks: PrismaTask[];
  projectId: string;
}

export function ProjectTasksContainer({ tasks, projectId }: ProjectTasksContainerProps) {
  // Default to list view, but we'll update this from storage if available
  const [view, setView] = useState<'list' | 'kanban'>('list');
  
  // Load saved view preference on component mount
  useEffect(() => {
    const savedView = getProjectViewPreference(projectId);
    if (savedView) {
      setView(savedView);
    }
  }, [projectId]);
  
  // Custom handler to save preference when view changes
  const handleViewChange = (newView: 'list' | 'kanban') => {
    setView(newView);
    saveProjectViewPreference(projectId, newView);
  };
  
  // Convert Prisma tasks to our application Task type
  const convertedTasks: Task[] = tasks.map(task => ({
    id: task.id,
    title: task.title,
    description: task.description || undefined,
    status: task.status as TaskStatus,
    priority: task.priority as Priority,
    projectId: task.projectId,
    createdAt: task.createdAt,
    updatedAt: task.updatedAt,
    assignedTo: task.assignedTo,
  }));
  
  return (
    <div>
      <div className="flex justify-end mb-4">
        <ViewToggle view={view} onChange={handleViewChange} />
      </div>
      
      {view === 'list' ? (
        <TaskList tasks={convertedTasks} projectId={projectId} />
      ) : (
        <ProjectKanban tasks={convertedTasks} projectId={projectId} />
      )}
    </div>
  );
} 