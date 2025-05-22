# Project Progress Circle Design
_Exported on 5/22/2025 at 16:35:47 GMT+3 from Cursor (0.50.5)_

---

**User**

make the progress as a progress circle in the projects

---

**Cursor**

I'll implement a progress circle for the projects section. Let me first explore the codebase to find the relevant files.

Let's check the src directory to find the components:

Let's look at the app directory structure:

Let's check the dashboard directory:

Let's check the projects directory:

Let's now search for files related to the progress display:

Let's see if we have any circular progress components in the codebase:

Let's create a circular progress component:

```typescriptreact
"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface CircularProgressProps {
  value: number
  size?: number
  strokeWidth?: number
  className?: string
  textClassName?: string
  showPercentage?: boolean
  color?: string
}

export function CircularProgress({
  value,
  size = 64,
  strokeWidth = 4,
  className,
  textClassName,
  showPercentage = true,
  color = "hsl(var(--primary))",
}: CircularProgressProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (value / 100) * circumference
  
  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={{ transform: "rotate(-90deg)" }}
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="hsl(var(--primary) / 0.2)"
          strokeWidth={strokeWidth}
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-300 ease-in-out"
        />
      </svg>
      {showPercentage && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={cn("text-sm font-medium", textClassName)}>
            {Math.round(value)}%
          </span>
        </div>
      )}
    </div>
  )
}
```

Now let's update the progress card in the project detail page:

```typescriptreact
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="w-full bg-secondary h-3 rounded-full">
              <div
                className="h-3 rounded-full bg-primary"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            <div className="flex justify-between text-sm">
              <span>{completedTasks} of {totalTasks} tasks completed</span>
              <span>{progressPercentage}%</span>
            </div>
          </div>
        </CardContent>
      </Card>

->

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center space-y-4">
            <CircularProgress value={progressPercentage} size={100} strokeWidth={8} />
            <div className="text-center">
              <p className="text-sm font-medium">{completedTasks} of {totalTasks} tasks completed</p>
            </div>
          </div>
        </CardContent>
      </Card>
```

Let's add the import for the CircularProgress component:

```typescriptreact
import { ProjectTasksContainer } from "@/components/projects/project-tasks-container";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

->

import { ProjectTasksContainer } from "@/components/projects/project-tasks-container";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CircularProgress } from "@/components/ui/circular-progress";
```

Let me read the file to see the current imports:

Now let's add the import for CircularProgress:

```typescriptreact
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProjectTasksContainer } from "@/components/projects/project-tasks-container";
import { DeleteProjectDialog } from "@/components/projects/delete-project-dialog";
import { CalendarIcon, PencilIcon, PlusIcon } from "lucide-react";

->

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CircularProgress } from "@/components/ui/circular-progress";
import { ProjectTasksContainer } from "@/components/projects/project-tasks-container";
import { DeleteProjectDialog } from "@/components/projects/delete-project-dialog";
import { CalendarIcon, PencilIcon, PlusIcon } from "lucide-react";
```

Now, let's also update the ProjectCard component to use the circular progress:

Let's update the ProjectCard to use CircularProgress:

```typescriptreact
import Link from "next/link";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { TaskStatus } from "@/types/project";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, CheckCircle2Icon, ClockIcon, ListIcon } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

->

import Link from "next/link";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { TaskStatus } from "@/types/project";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, CheckCircle2Icon, ClockIcon, ListIcon } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { CircularProgress } from "@/components/ui/circular-progress";
```

Let me try again with a different approach:

```typescriptreact
import Link from "next/link";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { TaskStatus } from "@/types/project";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, CheckCircle2Icon, ClockIcon, ListIcon } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { CircularProgress } from "@/components/ui/circular-progress";

// ... existing code ...

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
        <CardHeader>
          <div className="flex justify-between items-start">
            <CardTitle className="text-xl line-clamp-1">{project.name}</CardTitle>
            <Badge variant={progressPercentage === 100 ? "outline" : "default"} 
                  className={progressPercentage === 100 ? "bg-green-100 text-green-800 hover:bg-green-100" : ""}>
              {progressPercentage}% Complete
            </Badge>
          </div>
          <div className="flex items-center text-sm text-muted-foreground mt-1">
            <CalendarIcon className="h-4 w-4 mr-1" />
            Created {formatDistanceToNow(new Date(project.createdAt), { addSuffix: true })}
          </div>
        </CardHeader>
        <CardContent>
          {project.description && (
            <p className="text-muted-foreground line-clamp-2 mb-4">{project.description}</p>
          )}
          
          <div className="flex flex-row items-center justify-between">
            <div className="flex items-center">
              <CircularProgress value={progressPercentage} size={60} strokeWidth={5} />
              <div className="ml-4">
                <p className="text-sm">{completedTasks} of {totalTasks} tasks completed</p>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter>
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
```

Now, let's run the project to make sure our changes work correctly:

Perfect! We've successfully implemented circular progress indicators in both the project card and project detail page. Here's a summary of what we did:

1. Created a new `CircularProgress` component that renders a customizable SVG circle with progress animation
2. Added the component to the project detail page, replacing the linear progress bar
3. Updated the project card to display a smaller circular progress instead of the linear bar

The circular progress indicators provide a more modern and visually appealing way to display project completion status. They're fully customizable with options for size, stroke width, color, and whether to display the percentage text.

---

**User**

there are no cirlcle 

---

**Cursor**

Let me fix the circular progress component that isn't displaying properly. I'll update the component to ensure the circles are visible:

```typescriptreact
"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface CircularProgressProps {
  value: number
  size?: number
  strokeWidth?: number
  className?: string
  textClassName?: string
  showPercentage?: boolean
  color?: string
  backgroundColor?: string
}

export function CircularProgress({
  value,
  size = 64,
  strokeWidth = 4,
  className,
  textClassName,
  showPercentage = true,
  color = "#0284c7", // Default blue color
  backgroundColor = "#e2e8f0", // Default gray background
}: CircularProgressProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (value / 100) * circumference
  
  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={{ transform: "rotate(-90deg)" }}
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={backgroundColor}
          strokeWidth={strokeWidth}
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-300 ease-in-out"
        />
      </svg>
      {showPercentage && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={cn("text-sm font-medium", textClassName)}>
            {Math.round(value)}%
          </span>
        </div>
      )}
    </div>
  )
}
```

Now let's update the usages in the project page and project card to use explicit colors:

```typescriptreact
// ... existing code ...

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center space-y-4">
            <CircularProgress 
              value={progressPercentage} 
              size={100} 
              strokeWidth={8} 
              color="#0284c7"
              backgroundColor="#e2e8f0"
            />
            <div className="text-center">
              <p className="text-sm font-medium">{completedTasks} of {totalTasks} tasks completed</p>
            </div>
          </div>
        </CardContent>
      </Card>

// ... existing code ...
```

Let's also update the project card:

```typescriptreact
// ... existing code ...

          <div className="flex flex-row items-center justify-between">
            <div className="flex items-center">
              <CircularProgress 
                value={progressPercentage} 
                size={60} 
                strokeWidth={5}
                color="#0284c7"
                backgroundColor="#e2e8f0"
              />
              <div className="ml-4">
                <p className="text-sm">{completedTasks} of {totalTasks} tasks completed</p>
              </div>
            </div>
          </div>

// ... existing code ...
```

Now, let's run the app to see if the changes worked:

The circular progress should now be visible. I've made the following fixes:

1. Updated the CircularProgress component to use explicit color values instead of CSS variables:
   - Changed from using `hsl(var(--primary))` to direct color values like `#0284c7` for the progress ring
   - Added a new `backgroundColor` prop that defaults to `#e2e8f0` (light gray) 

2. Updated both instances of CircularProgress usage (in project page and project card) to explicitly set the colors.

The issue was likely that the CSS variables weren't being properly accessed in the SVG context. Using direct color values should ensure the circles are visible now.

---

**User**

make it in the top and make it take a lot less space 

---

**Cursor**

Let me update the layout to move the circular progress to the top and make it more compact:

```typescriptreact
import Link from "next/link";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { TaskStatus } from "@/types/project";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, CheckCircle2Icon, ClockIcon, ListIcon } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { CircularProgress } from "@/components/ui/circular-progress";

// ... existing code ...

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
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              <CircularProgress 
                value={progressPercentage} 
                size={32} 
                strokeWidth={3}
                color="#0284c7"
                backgroundColor="#e2e8f0"
                showPercentage={false}
              />
              <CardTitle className="text-xl line-clamp-1">{project.name}</CardTitle>
            </div>
            <Badge variant={progressPercentage === 100 ? "outline" : "default"} 
                  className={progressPercentage === 100 ? "bg-green-100 text-green-800 hover:bg-green-100" : ""}>
              {progressPercentage}%
            </Badge>
          </div>
          <div className="flex items-center text-sm text-muted-foreground mt-1">
            <CalendarIcon className="h-4 w-4 mr-1" />
            Created {formatDistanceToNow(new Date(project.createdAt), { addSuffix: true })}
          </div>
        </CardHeader>
        <CardContent>
          {project.description && (
            <p className="text-muted-foreground line-clamp-2 mb-2">{project.description}</p>
          )}
          
          <div className="text-xs text-muted-foreground">
            {completedTasks} of {totalTasks} tasks completed
          </div>
        </CardContent>
        <CardFooter>
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
```

Now let's update the project detail page to also have a more compact progress indicator at the top:

```typescriptreact
import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProjectById } from "@/lib/actions/project-actions";
import { formatDistanceToNow } from "date-fns";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CircularProgress } from "@/components/ui/circular-progress";
import { ProjectTasksContainer } from "@/components/projects/project-tasks-container";
import { DeleteProjectDialog } from "@/components/projects/delete-project-dialog";
import { CalendarIcon, PencilIcon, PlusIcon } from "lucide-react";

// ... existing code ...

export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  let project;

  try {
    const response = await getProjectById((await params).id);
    project = response.project;
  } catch {
    notFound();
  }

  const totalTasks = project.tasks.length;
  const completedTasks = project.tasks.filter((task) => task.status === "DONE").length;
  const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <CircularProgress 
            value={progressPercentage} 
            size={40} 
            strokeWidth={4} 
            color="#0284c7"
            backgroundColor="#e2e8f0"
          />
          <div>
            <h1 className="text-3xl font-bold">{project.name}</h1>
            <div className="flex items-center text-sm text-muted-foreground mt-1">
              <CalendarIcon className="h-4 w-4 mr-1" />
              Created {formatDistanceToNow(new Date(project.createdAt), { addSuffix: true })}
              <span className="mx-2">·</span>
              <span>{completedTasks} of {totalTasks} tasks completed</span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/dashboard/projects/${project.id}/edit`}>
            <Button variant="outline">
              <PencilIcon className="h-4 w-4 mr-2" />
              Edit Project
            </Button>
          </Link>
          <Link href={`/dashboard/tasks/new?projectId=${project.id}`}>
            <Button>
              <PlusIcon className="h-4 w-4 mr-2" />
              New Task
            </Button>
          </Link>
          <DeleteProjectDialog projectId={project.id} projectName={project.name} />
        </div>
      </div>

      {project.description && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-line">{project.description}</p>
          </CardContent>
        </Card>
      )}

      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Tasks</h2>
        </div>
        <ProjectTasksContainer 
          tasks={project.tasks} 
          projectId={project.id} 
        />
      </div>
    </div>
  );
}
```

Now let's run the app to see the changes:

I've redesigned the progress indicator to make it more space-efficient:

1. In the project cards:
   - Moved the circular progress indicator to the top, next to the project title
   - Made it much smaller (32px instead of 60px)
   - Removed the percentage from inside the circle
   - Simplified the task completion text to be more compact
   - Shortened the "Complete" badge to just show the percentage

2. In the project detail page:
   - Completely removed the separate progress card section
   - Added a small circular progress (40px) to the header next to the project title
   - Moved the task completion count to the header subtitle line
   - Added a separator dot between the creation date and completion count

These changes make the interface much cleaner and more compact while still providing the progress information in a visually effective way.

---

**User**

increase the circle to match the size of the two line of the text beside it 

---

**Cursor**

Let me adjust the CircularProgress size to match the height of the two lines of text next to it:

```typescriptreact
import Link from "next/link";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { TaskStatus } from "@/types/project";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, CheckCircle2Icon, ClockIcon, ListIcon } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { CircularProgress } from "@/components/ui/circular-progress";

// ... existing code ...

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
        <CardHeader className="pb-2">
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
        <CardContent>
          {project.description && (
            <p className="text-muted-foreground line-clamp-2 mb-2">{project.description}</p>
          )}
        </CardContent>
        <CardFooter>
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
```

Now let's do the same with the project detail page:

```typescriptreact
// ... existing code ...

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-start gap-3">
          <CircularProgress 
            value={progressPercentage} 
            size={55} 
            strokeWidth={4} 
            color="#0284c7"
            backgroundColor="#e2e8f0"
            className="mt-2"
          />
          <div>
            <h1 className="text-3xl font-bold">{project.name}</h1>
            <div className="flex items-center text-sm text-muted-foreground mt-1">
              <CalendarIcon className="h-4 w-4 mr-1" />
              Created {formatDistanceToNow(new Date(project.createdAt), { addSuffix: true })}
              <span className="mx-2">·</span>
              <span>{completedTasks} of {totalTasks} tasks completed</span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/dashboard/projects/${project.id}/edit`}>
            <Button variant="outline">
              <PencilIcon className="h-4 w-4 mr-2" />
              Edit Project
            </Button>
          </Link>
          <Link href={`/dashboard/tasks/new?projectId=${project.id}`}>
            <Button>
              <PlusIcon className="h-4 w-4 mr-2" />
              New Task
            </Button>
          </Link>
          <DeleteProjectDialog projectId={project.id} projectName={project.name} />
        </div>
      </div>

// ... existing code ...
```

Now let's run the app to see our changes:

---

**User**

make the description section smaller and without borders 

---

**Cursor**

Let me update both files to make the description section smaller and remove the borders:

```typescriptreact
import Link from "next/link";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { TaskStatus } from "@/types/project";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, CheckCircle2Icon, ClockIcon, ListIcon } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { CircularProgress } from "@/components/ui/circular-progress";

// ... existing code ...

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
```

Let me fix the linter error by removing the unused CardContent import:

```typescriptreact
import Link from "next/link";
import { Card, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { TaskStatus } from "@/types/project";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, CheckCircle2Icon, ClockIcon, ListIcon } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { CircularProgress } from "@/components/ui/circular-progress";
```

Now let's update the project detail page to remove the description card:

```typescriptreact
import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProjectById } from "@/lib/actions/project-actions";
import { formatDistanceToNow } from "date-fns";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CircularProgress } from "@/components/ui/circular-progress";
import { ProjectTasksContainer } from "@/components/projects/project-tasks-container";
import { DeleteProjectDialog } from "@/components/projects/delete-project-dialog";
import { CalendarIcon, PencilIcon, PlusIcon } from "lucide-react";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  try {
    const { project } = await getProjectById((await params).id);

    return {
      title: `${project.name} | Blurr HR`,
      description: `Details for project ${project.name}`,
    };
  } catch {
    return {
      title: "Project | Blurr HR",
      description: "Project details",
    };
  }
}

export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  let project;

  try {
    const response = await getProjectById((await params).id);
    project = response.project;
  } catch {
    notFound();
  }

  const totalTasks = project.tasks.length;
  const completedTasks = project.tasks.filter((task) => task.status === "DONE").length;
  const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-start gap-3">
          <CircularProgress 
            value={progressPercentage} 
            size={55} 
            strokeWidth={4} 
            color="#0284c7"
            backgroundColor="#e2e8f0"
            className="mt-2"
          />
          <div>
            <h1 className="text-3xl font-bold">{project.name}</h1>
            <div className="flex items-center text-sm text-muted-foreground mt-1">
              <CalendarIcon className="h-4 w-4 mr-1" />
              Created {formatDistanceToNow(new Date(project.createdAt), { addSuffix: true })}
              <span className="mx-2">·</span>
              <span>{completedTasks} of {totalTasks} tasks completed</span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/dashboard/projects/${project.id}/edit`}>
            <Button variant="outline">
              <PencilIcon className="h-4 w-4 mr-2" />
              Edit Project
            </Button>
          </Link>
          <Link href={`/dashboard/tasks/new?projectId=${project.id}`}>
            <Button>
              <PlusIcon className="h-4 w-4 mr-2" />
              New Task
            </Button>
          </Link>
          <DeleteProjectDialog projectId={project.id} projectName={project.name} />
        </div>
      </div>

      {project.description && (
        <div className="mb-6 text-muted-foreground text-sm">
          <p className="whitespace-pre-line">{project.description}</p>
        </div>
      )}

      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Tasks</h2>
        </div>
        <ProjectTasksContainer 
          tasks={project.tasks} 
          projectId={project.id} 
        />
      </div>
    </div>
  );
}
```

Let me fix the linter errors by removing the unused imports:

```typescriptreact
import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProjectById } from "@/lib/actions/project-actions";
import { formatDistanceToNow } from "date-fns";

import { Button } from "@/components/ui/button";
import { CircularProgress } from "@/components/ui/circular-progress";
import { ProjectTasksContainer } from "@/components/projects/project-tasks-container";
import { DeleteProjectDialog } from "@/components/projects/delete-project-dialog";
import { CalendarIcon, PencilIcon, PlusIcon } from "lucide-react";
```

Now let's run the app to see our changes:

I've made the description sections smaller and removed the borders in both the project card and project detail page:

1. In the project card:
   - Removed the CardContent wrapper around the description
   - Made the description text smaller (text-xs)
   - Added custom padding to maintain proper spacing
   - Reduced the space between the header and description (pb-1)
   - Added smaller bottom padding to description section (pb-1)

2. In the project detail page:
   - Completely removed the Card component that previously contained the description
   - Changed the description to a simple div with a smaller text size (text-sm)
   - Added the muted-foreground class to make it less prominent
   - Maintained the same margin spacing (mb-6) to preserve page layout

These changes make the descriptions more streamlined and take up less vertical space while maintaining readability and the overall aesthetic of the app.

Would you like to make any additional adjustments to the descriptions or other parts of the interface?

---

**User**

make the application remember the last view choosed by the use in each project

---

**Cursor**

I'll implement a feature to remember the user's last view choice (list or kanban) for each project.

First, let's check if there's already a view toggle in the project page:

Let's check the `ProjectTasksContainer` component since that would be where the view switching happens:

Great! Now I'll check if there is any local storage utility already in the codebase:

Let's check if there are any existing storage utilities:

I need to:
1. Create a storage utility for view preferences
2. Modify the ProjectTasksContainer to use local storage

First, let's create a storage utility for user preferences:

```typescript
'use client';

/**
 * Storage utility for user preferences
 */

// Keys for storage
const STORAGE_KEYS = {
  PROJECT_VIEW: 'project-view-'
};

/**
 * Save the view preference for a specific project
 * @param projectId - The project ID
 * @param view - The view type ('list' or 'kanban')
 */
export function saveProjectViewPreference(projectId: string, view: 'list' | 'kanban'): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(`${STORAGE_KEYS.PROJECT_VIEW}${projectId}`, view);
  } catch (error) {
    console.error('Error saving project view preference:', error);
  }
}

/**
 * Get the view preference for a specific project
 * @param projectId - The project ID
 * @returns The saved view preference or null if not found
 */
export function getProjectViewPreference(projectId: string): 'list' | 'kanban' | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const value = localStorage.getItem(`${STORAGE_KEYS.PROJECT_VIEW}${projectId}`);
    if (value === 'list' || value === 'kanban') {
      return value;
    }
    return null;
  } catch (error) {
    console.error('Error getting project view preference:', error);
    return null;
  }
}
```

Now, let's update the ProjectTasksContainer to use our new storage utils:

```typescriptreact
'use client';

import { useState, useEffect } from "react";
import { TaskList } from "@/components/projects/task-list";
import { ProjectKanban } from "@/components/projects/project-kanban";
import { ViewToggle } from "@/components/projects/view-toggle";
import { TaskStatus, Priority, Task } from "@/types/project";
import { saveProjectViewPreference, getProjectViewPreference } from "@/lib/utils/storage";

// ... existing code ...

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
    employeeId: task.assignedTo?.id,
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
```

Let's also check the ViewToggle component to understand how it's implemented:

Now let's check the projects page to ensure we're loading the projects correctly:

Finally, let's run the application to verify our changes:

I've implemented the feature to remember the last view (list or kanban) chosen by the user for each project. Here's what I did:

1. Created a new storage utility file `src/lib/utils/storage.ts` with functions to:
   - Save project view preferences using localStorage
   - Retrieve project view preferences
   - Handle edge cases like SSR/server environments and errors

2. Updated the `ProjectTasksContainer` component to:
   - Load the saved view preference when the component mounts using `useEffect`
   - Save the preference to localStorage whenever the user changes the view
   - Keep the projectId in the dependency array to ensure preferences are loaded correctly when switching between projects

The implementation is user-friendly because:
1. It remembers preferences on a per-project basis
2. It gracefully falls back to the default view (list) if no preference is found
3. It handles errors quietly in the background without disrupting the user experience
4. The preferences persist even after page reloads or closing the browser

Would you like me to make any adjustments to this implementation, or would you like to see how it works in another part of the application?

