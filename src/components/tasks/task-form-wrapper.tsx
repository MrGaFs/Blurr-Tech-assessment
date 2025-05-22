'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { TaskForm } from './task-form';
import { createTask, updateTask } from '@/lib/actions/task-actions';
import { Priority, TaskStatus } from '@/types/project';
import { Employee } from '@/types/employee';
import { Project } from '@/types/project';

interface TaskFormWrapperProps {
  taskId?: string;
  defaultValues?: {
    id?: string;
    title?: string;
    description?: string;
    priority?: Priority;
    status?: TaskStatus;
    employeeId?: string | null;
    projectId?: string;
  };
  employees: Employee[];
  projects: Project[];
}

type FormData = {
  id?: string;
  title: string;
  description?: string;
  priority: Priority;
  status: TaskStatus;
  employeeId?: string | null;
  projectId: string;
};

export function TaskFormWrapper({
  taskId,
  defaultValues = {},
  employees,
  projects,
}: TaskFormWrapperProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: FormData) => {
    setIsSubmitting(true);

    try {
      if (taskId) {
        // Update existing task
        await updateTask(taskId, {
          title: data.title,
          description: data.description,
          priority: data.priority,
          status: data.status,
          employeeId: data.employeeId === null ? undefined : data.employeeId,
          projectId: data.projectId
        });
        
        toast.success('Task updated', {
          description: `"${data.title}" has been updated.`,
        });
        
        router.push(`/dashboard/tasks/${taskId}`);
      } else {
        // Create new task
        await createTask({
          title: data.title,
          description: data.description,
          priority: data.priority,
          status: data.status,
          employeeId: data.employeeId === null ? undefined : data.employeeId,
          projectId: data.projectId
        });
        
        toast.success('Task created', {
          description: `"${data.title}" has been created.`,
        });
        
        router.push(`/dashboard/projects/${data.projectId}`);
      }
    } catch (error) {
      console.error('Failed to save task:', error);
      toast.error('Failed to save task', {
        description: error instanceof Error ? error.message : 'An unexpected error occurred.',
      });
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (taskId) {
      router.push(`/dashboard/tasks/${taskId}`);
    } else if (defaultValues.projectId) {
      router.push(`/dashboard/projects/${defaultValues.projectId}`);
    } else {
      router.push('/dashboard/tasks');
    }
  };

  return (
    <TaskForm
      defaultValues={defaultValues}
      employees={employees}
      projects={projects}
      onSubmit={handleSubmit}
      onCancel={handleCancel}
      isSubmitting={isSubmitting}
    />
  );
}
 