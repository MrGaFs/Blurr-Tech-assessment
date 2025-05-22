'use client';

import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { 
  CheckCircle2Icon, 
  CircleIcon, 
  ClockIcon, 
  EyeIcon,
  UserIcon
} from "lucide-react";
import { Priority, TaskStatus } from "@/types/project";

interface Employee {
  id: string;
  name: string;
}

export interface TaskCardProps {
  task: {
    id: string;
    title: string;
    description?: string | null;
    status: TaskStatus;
    priority: Priority;
    projectId: string;
    createdAt: Date;
    updatedAt: Date;
    assignedTo?: Employee | null;
    employeeId?: string | null;
    project?: {
      id: string;
      name: string;
    };
  };
  innerRef?: React.Ref<HTMLDivElement>;
}

export const getPriorityBadge = (priority: Priority) => {
  const tooltipText = {
    URGENT: "Requires immediate attention",
    HIGH: "High priority task",
    MEDIUM: "Medium priority task",
    LOW: "Low priority task"
  };

  const badge = (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div>
            {priority === "URGENT" && (
              <Badge variant="destructive">Urgent</Badge>
            )}
            {priority === "HIGH" && (
              <Badge variant="outline" className="bg-orange-100 text-orange-800 hover:bg-orange-100">
                High
              </Badge>
            )}
            {priority === "MEDIUM" && (
              <Badge variant="outline" className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                Medium
              </Badge>
            )}
            {priority === "LOW" && (
              <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">
                Low
              </Badge>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>{tooltipText[priority]}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );

  return badge;
};

export const getStatusIcon = (status: TaskStatus) => {
  const tooltipText = {
    TODO: "Task not yet started",
    IN_PROGRESS: "Task in progress",
    REVIEW: "Task under review",
    DONE: "Task completed"
  };

  const icon = (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          {status === "TODO" && <CircleIcon className="h-4 w-4 text-gray-500" />}
          {status === "IN_PROGRESS" && <ClockIcon className="h-4 w-4 text-blue-500" />}
          {status === "REVIEW" && <EyeIcon className="h-4 w-4 text-purple-500" />}
          {status === "DONE" && <CheckCircle2Icon className="h-4 w-4 text-green-500" />}
        </TooltipTrigger>
        <TooltipContent>
          <p>{tooltipText[status]}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );

  return icon;
};

export function TaskCard({ task, innerRef }: TaskCardProps) {
  return (
    <Card
      ref={innerRef}
      className="mb-2 p-3 bg-white shadow-sm hover:shadow cursor-pointer"
    >
      <div className="w-full">
        <Link 
          href={`/dashboard/tasks/${task.id}`} 
          className="block" 
          onClick={(e) => e.stopPropagation()}
          draggable="false"
        >
          <div className="flex justify-between items-start mb-2">
            <h4 className="font-medium line-clamp-2">{task.title}</h4>
            {getPriorityBadge(task.priority)}
          </div>
          
          {task.project && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="text-xs text-muted-foreground mb-2 truncate">
                    Project: {task.project.name}
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{task.project.name}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          
          <div className="flex items-center justify-between text-sm text-muted-foreground mt-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div>
                    {formatDistanceToNow(new Date(task.updatedAt), {
                      addSuffix: true,
                    })}
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Last updated: {new Date(task.updatedAt).toLocaleString()}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            {(task.assignedTo || task.employeeId) && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-1">
                      <UserIcon className="h-3 w-3" />
                      <span>{task.assignedTo ? task.assignedTo.name : "Assigned"}</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{task.assignedTo ? `Assigned to: ${task.assignedTo.name}` : "Task is assigned"}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        </Link>
      </div>
    </Card>
  );
} 