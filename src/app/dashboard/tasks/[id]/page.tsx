import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getTaskById } from "@/lib/actions/task-actions";
import { formatDistanceToNow } from "date-fns";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  CalendarIcon, 
  ClipboardIcon, 
  PencilIcon, 
  TrashIcon,
  FolderIcon,
  UserIcon,
  ArrowLeftIcon
} from "lucide-react";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  try {
    const { task } = await getTaskById((await params).id);

    return {
      title: `${task.title} | Blurr HR`,
      description: `Details for task ${task.title}`,
    };
  } catch {
    return {
      title: "Task | Blurr HR",
      description: "Task details",
    };
  }
}

// Define response type to match the structure from the database
type TaskResponse = {
  id: string;
  title: string;
  description: string | null;
  priority: string;
  status: string;
  employeeId: string | null;
  projectId: string;
  createdAt: Date;
  updatedAt: Date;
  assignedTo: {
    id: string;
    name: string;
    // Other fields exist but aren't needed for display
  } | null;
  project: {
    id: string;
    name: string;
    // Other fields exist but aren't needed for display
  };
};

export default async function TaskPage({ params }: { params: Promise<{ id: string }> }) {
  let task: TaskResponse;

  try {
    const response = await getTaskById((await params).id);
    task = response.task;
  } catch (error) {
    console.error("Error fetching task:", error);
    notFound();
  }

  // Helper function to get priority badge
  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'URGENT':
        return <Badge variant="destructive">Urgent</Badge>;
      case 'HIGH':
        return <Badge variant="outline" className="bg-orange-100 text-orange-800">High</Badge>;
      case 'MEDIUM':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800">Medium</Badge>;
      case 'LOW':
        return <Badge variant="outline" className="bg-green-100 text-green-800">Low</Badge>;
      default:
        return <Badge variant="outline">{priority}</Badge>;
    }
  };

  // Helper function to get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'DONE':
        return <Badge className="bg-green-100 text-green-800">Done</Badge>;
      case 'IN_PROGRESS':
        return <Badge className="bg-blue-100 text-blue-800">In Progress</Badge>;
      case 'REVIEW':
        return <Badge className="bg-purple-100 text-purple-800">Review</Badge>;
      case 'TODO':
        return <Badge className="bg-gray-100 text-gray-800">To Do</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <Link href={`/dashboard/projects/${task.projectId}`} className="flex items-center text-sm text-muted-foreground hover:text-foreground mb-2">
          <ArrowLeftIcon className="h-4 w-4 mr-1" />
          Back to project
        </Link>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold">{task.title}</h1>
              {getPriorityBadge(task.priority)}
              {getStatusBadge(task.status)}
            </div>
            <div className="flex items-center text-sm text-muted-foreground mt-2 gap-4">
              <div className="flex items-center">
                <CalendarIcon className="h-4 w-4 mr-1" />
                Updated {formatDistanceToNow(new Date(task.updatedAt), { addSuffix: true })}
              </div>
              <div className="flex items-center">
                <FolderIcon className="h-4 w-4 mr-1" />
                Project: <Link href={`/dashboard/projects/${task.project.id}`} className="ml-1 hover:underline">{task.project.name}</Link>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Link href={`/dashboard/tasks/${task.id}/edit`}>
              <Button variant="outline">
                <PencilIcon className="h-4 w-4 mr-2" />
                Edit
              </Button>
            </Link>
            <Link href={`/dashboard/tasks/${task.id}/delete`}>
              <Button variant="destructive">
                <TrashIcon className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <ClipboardIcon className="h-5 w-5 mr-2" />
                Description
              </CardTitle>
            </CardHeader>
            <CardContent>
              {task.description ? (
                <p className="whitespace-pre-line">{task.description}</p>
              ) : (
                <p className="text-muted-foreground italic">No description provided.</p>
              )}
            </CardContent>
          </Card>
        </div>
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Status</h3>
                {getStatusBadge(task.status)}
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Priority</h3>
                {getPriorityBadge(task.priority)}
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Assigned to</h3>
                {task.assignedTo ? (
                  <div className="flex items-center">
                    <UserIcon className="h-4 w-4 mr-2" />
                    <Link href={`/dashboard/employees/${task.assignedTo.id}`} className="hover:underline">
                      {task.assignedTo.name}
                    </Link>
                  </div>
                ) : (
                  <p className="text-muted-foreground">Unassigned</p>
                )}
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Created</h3>
                <p>{new Date(task.createdAt).toLocaleDateString()}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Updated</h3>
                <p>{new Date(task.updatedAt).toLocaleDateString()}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 