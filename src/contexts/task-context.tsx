'use client';

import React, { createContext, useState, useContext, useCallback, ReactNode } from 'react';
import { Task, TaskStatus } from '@/types/project';
import { updateTaskStatus } from '@/lib/actions/task-actions';
import { toast } from 'sonner';

interface TaskContextType {
  tasks: Task[];
  setTasks: (tasks: Task[]) => void;
  isUpdating: string | null;
  moveTask: (taskId: string, newStatus: TaskStatus) => Promise<void>;
  refreshTasks: () => void;
  loading: boolean;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export function TaskProvider({ 
  children, 
  initialTasks = [] 
}: { 
  children: ReactNode, 
  initialTasks?: Task[] 
}) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Function to move a task to a different status
  const moveTask = async (taskId: string, newStatus: TaskStatus) => {
    if (isUpdating) return; // Prevent multiple simultaneous updates
    
    setIsUpdating(taskId);
    
    // Get the task
    const task = tasks.find(t => t.id === taskId);
    if (!task) {
      setIsUpdating(null);
      return;
    }
    
    // Update locally first (optimistic update)
    setTasks(currentTasks => 
      currentTasks.map(t => 
        t.id === taskId ? { ...t, status: newStatus } : t
      )
    );
    
    try {
      // Then update in the database
      await updateTaskStatus(taskId, newStatus);
      toast.success(`Task moved to ${newStatus.replace("_", " ")}`);
    } catch (error) {
      // If there's an error, revert to the original status
      console.error("Error updating task status:", error);
      toast.error("Failed to update task status");
      setTasks(initialTasks);
    } finally {
      setIsUpdating(null);
    }
  };

  // Function to refresh tasks if needed
  const refreshTasks = useCallback(() => {
    // This function can be implemented to fetch fresh data
    // from the server if needed
    setLoading(true);
    
    // Currently a placeholder - you would implement actual
    // data fetching here when needed
    
    setLoading(false);
  }, []);

  return (
    <TaskContext.Provider 
      value={{ 
        tasks, 
        setTasks, 
        isUpdating, 
        moveTask,
        refreshTasks,
        loading
      }}
    >
      {children}
    </TaskContext.Provider>
  );
}

export function useTaskContext() {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error('useTaskContext must be used within a TaskProvider');
  }
  return context;
} 