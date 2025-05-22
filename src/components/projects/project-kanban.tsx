'use client';

import { TaskStatus, Task } from "@/types/project";
import { PlusIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getStatusIcon } from "@/components/tasks/task-card";
import { TaskProvider, useTaskContext } from "@/contexts/task-context";
import { TaskCard } from "./task-card";
import { 
  DndContext, 
  DragEndEvent,
  DragOverEvent, 
  DragOverlay,
  DragStartEvent, 
  KeyboardSensor, 
  MouseSensor, 
  PointerSensor,
  useSensor, 
  useSensors,
  defaultDropAnimation,
  closestCorners
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable
} from "@dnd-kit/sortable";
import { useState } from "react";
import { toast } from "sonner";
import { useDroppable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";

interface ProjectKanbanProps {
  tasks: Task[];
  projectId: string;
}

// Define column IDs - just use the status directly for simpler mapping
const CONTAINERS = Object.values(TaskStatus);

// Sortable task component that wraps TaskCard with dnd-kit's useSortable
function SortableTaskItem({
  task,
  isDragging = false,
}: {
  task: Task;
  isUpdating?: string | null;
  moveTask?: (taskId: string, newStatus: TaskStatus) => Promise<void>;
  isDragging?: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({
    id: task.id,
    data: {
      type: 'task',
      task,
    },
  });
  
  const style = transform ? {
    transform: CSS.Transform.toString(transform),
    transition,
  } : undefined;

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className="transition-all"
      {...attributes}
    >
      <TaskCard
        task={task}
        isDragging={isDragging || isSortableDragging}
        dragHandleProps={listeners}
      />
    </div>
  );
}

// Droppable column component
function Column({
  id,
  tasks,
  title,
  projectId,
  isUpdating,
  moveTask,
  activeId,
}: {
  id: TaskStatus;
  tasks: Task[];
  title: string;
  projectId: string;
  isUpdating: string | null;
  moveTask: (taskId: string, newStatus: TaskStatus) => Promise<void>;
  activeId: string | null;
}) {
  // Column style
  const getColumnStyle = (status: TaskStatus) => {
    switch (status) {
      case TaskStatus.TODO: return "bg-gray-50";
      case TaskStatus.IN_PROGRESS: return "bg-blue-50";
      case TaskStatus.REVIEW: return "bg-purple-50";
      case TaskStatus.DONE: return "bg-green-50";
      default: return "bg-gray-50";
    }
  };

  // Set up the droppable
  const { setNodeRef } = useDroppable({
    id,
    data: {
      type: 'container',
      status: id,
    },
  });

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden flex flex-col h-full">
      {/* Column Header */}
      <div className={`rounded-t-lg p-3 flex items-center justify-between ${getColumnStyle(id)}`}>
        <div className="flex items-center gap-2">
          {getStatusIcon(id)}
          <h3 className="font-medium">
            {title} ({tasks.length})
          </h3>
        </div>
        <Link href={`/dashboard/tasks/new?projectId=${projectId}&status=${id}`}>
          <Button variant="ghost" size="icon" className="h-6 w-6" title={`Add ${id} task`}>
            <PlusIcon className="h-4 w-4" />
          </Button>
        </Link>
      </div>

      {/* Column Content */}
      <div 
        ref={setNodeRef}
        className="p-2 flex-grow min-h-[300px] rounded-b-lg border transition-colors"
      >
        <SortableContext 
          items={tasks.map(task => task.id)} 
          strategy={verticalListSortingStrategy}
        >
          {tasks.length === 0 ? (
            // Empty column state
            <div 
              className="h-full min-h-[200px] flex items-center justify-center border-2 border-dashed border-gray-200 rounded-md transition-colors"
            >
              <p className="text-gray-400 pointer-events-none">
                {activeId ? 'Drop here' : 'No tasks'}
              </p>
            </div>
          ) : (
            // Container for tasks
            <div className="space-y-3">
              {tasks.map(task => (
                <SortableTaskItem
                  key={task.id}
                  task={task}
                  isUpdating={isUpdating}
                  moveTask={moveTask}
                  isDragging={activeId === task.id}
                />
              ))}
            </div>
          )}
        </SortableContext>
      </div>
    </div>
  );
}

function ProjectKanbanContent({ projectId }: { projectId: string }) {
  const { tasks, isUpdating, moveTask } = useTaskContext();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  
  // Configure sensors for drag detection
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // Decreased for better responsiveness
      },
    }),
    useSensor(MouseSensor),
    useSensor(KeyboardSensor)
  );
  
  // Format column header
  const formatColumnHeader = (status: TaskStatus) => {
    return status === TaskStatus.IN_PROGRESS ? "In Progress" : status.replace("_", " ");
  };
  
  // Group tasks by status
  const tasksByStatus = Object.values(TaskStatus).reduce((acc, status) => {
    acc[status] = tasks.filter(task => task.status === status);
    return acc;
  }, {} as Record<string, Task[]>);

  // Find task by ID
  const findTask = (id: string) => {
    return tasks.find(task => task.id === id);
  };
  
  // Find the container (status) a task belongs to
  const findContainer = (id: string) => {
    if (id in TaskStatus) return id as TaskStatus;
    
    const task = findTask(id as string);
    return task ? task.status : null;
  };

  // Log debug info
  const logDebug = (message: string, data: Record<string, unknown> = {}) => {
    console.log(`[DndDebug] ${message}`, data);
  };
  
  // Handle drag start
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const id = active.id as string;
    
    const task = findTask(id);
    if (task) {
      setActiveId(id);
      setActiveTask(task);
      logDebug("Drag started", { taskId: id, task });
    }
  };
  
  // Handle drag end - this is where the magic happens
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    logDebug("Drag ended", { active, over });
    
    if (!over) {
      // Dropped outside any valid target
      setActiveId(null);
      setActiveTask(null);
      return;
    }
    
    const activeId = active.id as string;
    const overId = over.id as string;
    
    // Find the containers
    const activeContainer = findContainer(activeId);
    const overContainer = findContainer(overId);
    
    if (!activeContainer || !overContainer) {
      setActiveId(null);
      setActiveTask(null);
      return;
    }
    
    logDebug("Processing drop", {
      activeId,
      overId,
      activeContainer,
      overContainer,
    });
    
    // Different container - move the task to new status
    if (activeContainer !== overContainer) {
      const task = findTask(activeId);
      if (task && overContainer) {
        try {
          await moveTask(activeId, overContainer);
          toast.success(`Task moved to ${formatColumnHeader(overContainer)}`);
        } catch (error) {
          toast.error("Failed to move task");
          console.error(error);
        }
      }
    }

    // Reset state
    setActiveId(null);
    setActiveTask(null);
  };
  
  // Handle drag over for visual feedback
  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    
    if (!over) return;
    
    const activeId = active.id as string;
    const overId = over.id as string;
    
    // Find the containers
    const activeContainer = findContainer(activeId);
    const overContainer = findContainer(overId);
    
    if (!activeContainer || !overContainer) return;
    
    logDebug("Drag over", {
      activeId,
      overId,
      activeContainer,
      overContainer,
    });
  };

  // Default drop animation
  const dropAnimation = defaultDropAnimation;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
    >
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {CONTAINERS.map((status) => (
          <Column
            key={status}
            id={status}
            tasks={tasksByStatus[status] || []}
            title={formatColumnHeader(status)}
            projectId={projectId}
            isUpdating={isUpdating}
            moveTask={moveTask}
            activeId={activeId}
          />
      ))}
    </div>
      
      {/* Drag overlay for showing the dragged task */}
      <DragOverlay dropAnimation={dropAnimation}>
        {activeTask ? (
          <TaskCard
            task={activeTask}
            isDragging={true}
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

export function ProjectKanban({ tasks: initialTasks, projectId }: ProjectKanbanProps) {
  return (
    <TaskProvider initialTasks={initialTasks}>
      <ProjectKanbanContent projectId={projectId} />
    </TaskProvider>
  );
} 