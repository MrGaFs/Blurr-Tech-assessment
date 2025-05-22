'use client';

import { TaskStatus, Task } from "@/types/project";
import { PlusIcon, ChevronLeftIcon, ChevronRightIcon, ClockIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getStatusIcon, getPriorityBadge } from "@/components/tasks/task-card";
import { formatDistanceToNow } from "date-fns";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { DndContext, DragOverlay, PointerSensor, useSensor, useSensors, DragStartEvent, DragEndEvent, DragOverEvent } from '@dnd-kit/core';
import { useDroppable } from '@dnd-kit/core';
import { useDraggable } from '@dnd-kit/core';
import { useTaskContext, TaskProvider } from "@/contexts/task-context";
import { useState } from "react";

// Define interfaces
interface DraggableTaskCardProps {
  task: Task;
  isUpdating: string | null;
}

// Draggable Task Card component
function DraggableTaskCard({ task, isUpdating }: DraggableTaskCardProps) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: task.id,
    data: task,
  });
  
  // Get initials from a name
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  // Get previous status
  const getPrevStatus = (status: TaskStatus): TaskStatus | null => {
    const statuses = Object.values(TaskStatus);
    const currentIndex = statuses.indexOf(status);
    return currentIndex > 0 ? statuses[currentIndex - 1] : null;
  };
  
  // Get next status
  const getNextStatus = (status: TaskStatus): TaskStatus | null => {
    const statuses = Object.values(TaskStatus);
    const currentIndex = statuses.indexOf(status);
    return currentIndex < statuses.length - 1 ? statuses[currentIndex + 1] : null;
  };
  
  // Format column header
  const formatColumnHeader = (status: TaskStatus) => {
    return status === TaskStatus.IN_PROGRESS ? "In Progress" : status.replace("_", " ");
  };
  
  return (
    <Card 
      ref={setNodeRef} 
      {...attributes} 
      {...listeners}
      className={`p-1 mb-3 bg-white shadow-sm hover:shadow-md border-l-4 ${
        isDragging ? 'opacity-50' : ''
      }`} 
      style={{ 
        borderLeftColor: task.priority === "URGENT" ? "#ef4444" : 
                         task.priority === "HIGH" ? "#f97316" : 
                         task.priority === "MEDIUM" ? "#3b82f6" : 
                         "#22c55e",
        cursor: isDragging ? 'grabbing' : 'grab'
      }}
    >
      <div className="flex justify-between items-start">
        <Link href={`/dashboard/tasks/${task.id}`} className="hover:underline max-w-[70%]" onClick={(e) => isDragging && e.preventDefault()}>
          <h4 className="font-medium text-sm leading-tight truncate">{task.title}</h4>
        </Link>
        <div className="ml-1 flex-shrink-0">
          {getPriorityBadge(task.priority)}
        </div>
      </div>
      
      {task.project && (
        <div className="text-xs text-muted-foreground truncate">
          Project: {task.project.name}
        </div>
      )}
      
      <div className="flex justify-between items-center mt-1">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <ClockIcon className="h-3 w-3" />
                <span>{formatDistanceToNow(new Date(task.updatedAt), { addSuffix: true })}</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Last updated: {new Date(task.updatedAt).toLocaleString()}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      
      {/* Assignee section */}
      {task.assignedTo ? (
        <div className="flex items-center gap-2 mt-1 bg-gray-50 rounded-md p-1 text-xs">
          <Avatar className="h-5 w-5">
            <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
              {getInitials(task.assignedTo.name)}
            </AvatarFallback>
          </Avatar>
          <span className="font-medium truncate">{task.assignedTo.name}</span>
        </div>
      ) : (
        <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground italic">
          <span>Unassigned</span>
        </div>
      )}
      
      <div className="flex justify-between mt-1.5">
        {/* Previous status button */}
        {getPrevStatus(task.status as TaskStatus) && (
          <Button 
            size="sm" 
            variant="outline"
            className="text-[10px] h-5 px-1"
            disabled={isUpdating === task.id}
            onClick={(e) => {
              e.stopPropagation();
              // This is handled by the parent component
            }}
          >
            <ChevronLeftIcon className="h-3 w-3 mr-0.5" />
            {formatColumnHeader(getPrevStatus(task.status as TaskStatus)!)}
          </Button>
        )}
        
        <div className="flex-1" />
        
        {/* Next status button */}
        {getNextStatus(task.status as TaskStatus) && (
          <Button 
            size="sm" 
            variant="outline"
            className="text-[10px] h-5 px-1"
            disabled={isUpdating === task.id}
            onClick={(e) => {
              e.stopPropagation();
              // This is handled by the parent component
            }}
          >
            {formatColumnHeader(getNextStatus(task.status as TaskStatus)!)}
            <ChevronRightIcon className="h-3 w-3 ml-0.5" />
          </Button>
        )}
      </div>
    </Card>
  );
}

// Droppable Column component
function DroppableColumn({ status, children, isOver }: { 
  status: TaskStatus; 
  children: React.ReactNode;
  isOver: boolean;
}) {
  const { setNodeRef } = useDroppable({
    id: status,
    data: { status },
  });

  return (
    <div ref={setNodeRef} className={`transition-all duration-200 ${isOver ? 'scale-[1.02]' : ''}`}>
      {children}
    </div>
  );
}

interface KanbanBoardProps {
  initialTasks: Task[];
}

function KanbanBoardContent() {
  // Use the task context instead of local state
  const { tasks, isUpdating, moveTask } = useTaskContext();
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [activeDroppable, setActiveDroppable] = useState<string | null>(null);
  
  // Configure sensors for drag detection
  const sensors = useSensors(
    useSensor(PointerSensor, {
      // Require a minimum distance of 8 pixels to be dragged
      activationConstraint: {
        distance: 8,
      },
    })
  );
  
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
  
  // Format column header
  const formatColumnHeader = (status: TaskStatus) => {
    return status === TaskStatus.IN_PROGRESS ? "In Progress" : status.replace("_", " ");
  };
  
  // Handle drag start
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = active.data.current as Task;
    setActiveTask(task);
  };

  // Handle drag end
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over || !active) return;
    
    const taskId = active.id as string;
    const newStatus = over.id as TaskStatus;
    const task = tasks.find(t => t.id === taskId);
    
    if (task && task.status !== newStatus) {
      await moveTask(taskId, newStatus);
    }
    
    setActiveTask(null);
    setActiveDroppable(null);
  };
  
  // Handle drag over
  const handleDragOver = (event: DragOverEvent) => {
    const { over } = event;
    setActiveDroppable(over?.id?.toString() || null);
  };
  
  // Group tasks by status
  const tasksByStatus = Object.values(TaskStatus).reduce((acc, status) => {
    acc[status] = tasks.filter(task => task.status === status);
    return acc;
  }, {} as Record<string, Task[]>);
  
  return (
    <DndContext 
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
    >
      <div className="p-4 bg-gray-100 rounded-lg">
        <h2 className="text-2xl font-bold mb-6">Kanban Board</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {Object.entries(tasksByStatus).map(([status, columnTasks]) => (
            <DroppableColumn key={status} status={status as TaskStatus} isOver={activeDroppable === status}>
              <div className={`bg-white rounded-lg shadow-sm overflow-hidden`}>
                <div className={`p-3 ${getColumnStyle(status as TaskStatus)}`}>
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium flex items-center gap-2">
                      {getStatusIcon(status as TaskStatus)}
                      {formatColumnHeader(status as TaskStatus)} ({columnTasks.length})
                    </h3>
                    <Link href={`/dashboard/tasks/new?status=${status}`}>
                      <Button variant="ghost" size="icon" className="h-6 w-6" title={`Add new ${status} task`}>
                        <PlusIcon className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
                
                <div className="p-2 min-h-[150px]">
                  {columnTasks.length === 0 ? (
                    <div className="p-2 text-center text-gray-400">
                      No tasks
                    </div>
                  ) : (
                    columnTasks.map(task => (
                      <DraggableTaskCard 
                        key={task.id} 
                        task={task} 
                        isUpdating={isUpdating} 
                      />
                    ))
                  )}
                </div>
              </div>
            </DroppableColumn>
          ))}
        </div>
      </div>
      
      {/* Drag Overlay for visual feedback */}
      <DragOverlay>
        {activeTask ? (
          <div className="opacity-80 transform scale-105 w-full">
            <Card className="p-1 mb-3 bg-white shadow-lg border-l-4" style={{ 
              borderLeftColor: activeTask.priority === "URGENT" ? "#ef4444" : 
                              activeTask.priority === "HIGH" ? "#f97316" : 
                              activeTask.priority === "MEDIUM" ? "#3b82f6" : 
                              "#22c55e" 
            }}>
              <div className="flex justify-between items-start">
                <div className="max-w-[70%]">
                  <h4 className="font-medium text-sm leading-tight truncate">{activeTask.title}</h4>
                </div>
                <div className="ml-1 flex-shrink-0">
                  {getPriorityBadge(activeTask.priority)}
                </div>
              </div>
              
              {activeTask.project && (
                <div className="text-xs text-muted-foreground truncate">
                  Project: {activeTask.project.name}
                </div>
              )}
              
              {/* Show assignee in drag overlay */}
              {activeTask.assignedTo && (
                <div className="flex items-center gap-2 mt-1 bg-gray-50 rounded-md p-1 text-xs">
                  <Avatar className="h-5 w-5">
                    <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
                      {activeTask.assignedTo.name
                        .split(' ')
                        .map(part => part[0])
                        .join('')
                        .toUpperCase()
                        .substring(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-medium truncate">{activeTask.assignedTo.name}</span>
                </div>
              )}
            </Card>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

// Export the wrapper component with the TaskProvider
export function KanbanBoard({ initialTasks }: KanbanBoardProps) {
  return (
    <TaskProvider initialTasks={initialTasks}>
      <KanbanBoardContent />
    </TaskProvider>
  );
} 