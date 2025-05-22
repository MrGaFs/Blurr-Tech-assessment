import { Task, TaskStatus } from "@/types/project";
import { ClockIcon, GripVertical } from "lucide-react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { getPriorityBadge } from "@/components/tasks/task-card";
import { formatDistanceToNow } from "date-fns";
import { Tooltip, TooltipProvider, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import React from "react";

interface TaskCardProps {
  task: Task;
  isUpdating?: string | null;
  moveTask?: (taskId: string, newStatus: TaskStatus) => Promise<void>;
  isDragging?: boolean;
  dragHandleProps?: React.HTMLAttributes<HTMLDivElement>;
}

// Get initials from a name
const getInitials = (name: string) => {
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
};

export function TaskCard({ task, isDragging = false, dragHandleProps }: TaskCardProps) {
  // Get border color based on priority
  const getBorderColor = () => {
    return task.priority === "URGENT" ? "#ef4444" : 
           task.priority === "HIGH" ? "#f97316" : 
           task.priority === "MEDIUM" ? "#3b82f6" : 
           "#22c55e";
  };
  
  return (
    <Card 
      className={cn(
        "p-3 mb-3 bg-white shadow-sm hover:shadow-md border-l-4 gap-2 relative group",
        isDragging && "shadow-lg opacity-40"
      )}
      style={{ borderLeftColor: getBorderColor() }}
      data-task-id={task.id}
      data-status={task.status}
      data-draggable="true"
    >
      {/* Drag handle */}
      <div
        className="absolute right-1 top-1 opacity-30 group-hover:opacity-100 cursor-grab active:cursor-grabbing"
        aria-label="Drag handle"
        data-drag-handle="true"
        {...dragHandleProps}
      >
        <GripVertical size={16} />
      </div>

      <div className="flex justify-between items-start">
        <Link href={`/dashboard/tasks/${task.id}`} className="hover:underline max-w-[70%]">
          <h4 className="font-medium text-sm leading-tight truncate">{task.title}</h4>
        </Link>
        <div className="ml-1 flex-shrink-0">
          {getPriorityBadge(task.priority)}
        </div>
      </div>
      
      <div className="flex justify-between items-center text-xs text-muted-foreground mt-1">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-1">
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
        <div className="flex items-center gap-2 mt-1 bg-gray-50 rounded-md p-1 text-xs">
          <span className="font-medium truncate">Unassigned</span>
        </div>
      )}
    </Card>
  );
} 