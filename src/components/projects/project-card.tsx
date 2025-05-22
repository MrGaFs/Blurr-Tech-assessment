import Link from "next/link";
import { Card, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { TaskStatus } from "@/types/project";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, CheckCircle2Icon, ClockIcon, ListIcon } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { CircularProgress } from "@/components/ui/circular-progress";

interface ProjectWithTasks {
  id: string;
  name: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
  tasks: {
    id: string;
    title: string;
    status: string;
  }[];
}

interface ProjectCardProps {
  project: ProjectWithTasks;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const totalTasks = project.tasks.length;
  const completedTasks = project.tasks.filter(task => task.status === TaskStatus.DONE).length;
  const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 100;
  
  const tasksByStatus = project.tasks.reduce((acc, task) => {
    const status = task.status as TaskStatus;
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  return (
    <Link href={`/dashboard/projects/${project.id}`}>
      <Card className="h-full hover:shadow-md transition-shadow">
        <CardHeader className="pb-1">
          <div className="flex justify-between items-start">
            <div className="flex items-start gap-3">
              <CircularProgress 
                value={progressPercentage} 
                size={45} 
                strokeWidth={3}
                color="#0284c7"
                backgroundColor="#e2e8f0"
                showPercentage={false}
                className="mt-1"
              />
              <div>
                <CardTitle className="text-xl line-clamp-1">{project.name}</CardTitle>
                <div className="flex items-center text-sm text-muted-foreground mt-1">
                  <CalendarIcon className="h-4 w-4 mr-1" />
                  Created {formatDistanceToNow(new Date(project.createdAt), { addSuffix: true })}
                  <span className="mx-2">·</span>
                  <span>{completedTasks} of {totalTasks} tasks completed</span>
                </div>
              </div>
            </div>
            <Badge variant={progressPercentage === 100 ? "outline" : "default"} 
                  className={progressPercentage === 100 ? "bg-green-100 text-green-800 hover:bg-green-100" : ""}>
              {progressPercentage}%
            </Badge>
          </div>
        </CardHeader>
        
        {project.description && (
          <div className="px-6 pb-1">
            <p className="text-xs text-muted-foreground line-clamp-2">{project.description}</p>
          </div>
        )}
        
        <CardFooter className="pt-3">
          <div className="flex w-full gap-2 text-sm">
            <div className="flex items-center">
              <ListIcon className="h-4 w-4 mr-1 text-gray-500" />
              <span className="text-muted-foreground">{tasksByStatus[TaskStatus.TODO] || 0} To Do</span>
            </div>
            <div className="flex items-center">
              <ClockIcon className="h-4 w-4 mr-1 text-blue-500" />
              <span className="text-muted-foreground">
                {(tasksByStatus[TaskStatus.IN_PROGRESS] || 0) + (tasksByStatus[TaskStatus.REVIEW] || 0)} In Progress
              </span>
            </div>
            <div className="flex items-center">
              <CheckCircle2Icon className="h-4 w-4 mr-1 text-green-500" />
              <span className="text-muted-foreground">{tasksByStatus[TaskStatus.DONE] || 0} Done</span>
            </div>
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
} 