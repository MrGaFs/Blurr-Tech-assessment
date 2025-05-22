"use client";

import { useState } from "react";
import Link from "next/link";
import { TaskStatus, Priority } from "@/types/project";
import { 
  CheckCircle2Icon, 
  CircleIcon, 
  ClockIcon, 
  ExternalLinkIcon, 
  EyeIcon, 
  PencilIcon, 
  TrashIcon, 
  UserIcon,
  FilterIcon,
  ArrowUpDownIcon,
  ArrowDownIcon,
  ArrowUpIcon
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { updateTaskStatus, deleteTask } from "@/lib/actions/task-actions";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

interface Employee {
  id: string;
  name: string;
}

interface Task {
  id: string;
  title: string;
  description?: string | null;
  status: TaskStatus;
  priority: Priority;
  createdAt: Date;
  updatedAt: Date;
  assignedTo?: Employee | null;
}

interface TaskListProps {
  tasks: Task[];
  projectId: string;
}

export function TaskList({ tasks, projectId }: TaskListProps) {
  const [priorityFilter, setPriorityFilter] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'title' | 'status' | 'priority' | 'createdAt'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const filteredTasks = tasks.filter((task) => {
    if (priorityFilter && task.priority.toString() !== priorityFilter) {
      return false;
    }
    if (statusFilter && task.status.toString() !== statusFilter) {
      return false;
    }
    return true;
  });
  
  // Sort the filtered tasks
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'title':
        comparison = a.title.localeCompare(b.title);
        break;
      case 'status':
        comparison = a.status.toString().localeCompare(b.status.toString());
        break;
      case 'priority':
        // Custom priority order: URGENT > HIGH > MEDIUM > LOW
        const priorityOrder: Record<string, number> = {
          URGENT: 4,
          HIGH: 3,
          MEDIUM: 2,
          LOW: 1
        };
        comparison = (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
        break;
      case 'createdAt':
        comparison = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        break;
    }
    
    // Toggle comparison direction based on sort order
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };
  
  const handleSort = (field: 'title' | 'status' | 'priority' | 'createdAt') => {
    if (sortBy === field) {
      toggleSortOrder();
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const handleStatusChange = async (taskId: string, status: string) => {
    try {
      await updateTaskStatus(taskId, status as TaskStatus);
      toast.success("Task status updated successfully");
    } catch (error) {
      console.error("Error updating task status:", error);
      toast.error("Failed to update task status");
    }
  };

  const handleDeleteConfirm = async () => {
    if (!taskToDelete) return;

    try {
      await deleteTask(taskToDelete);
      toast.success("Task deleted successfully");
      setDeleteDialogOpen(false);
      setTaskToDelete(null);
    } catch (error) {
      console.error("Error deleting task:", error);
      toast.error("Failed to delete task");
    }
  };

  const openDeleteDialog = (taskId: string) => {
    setTaskToDelete(taskId);
    setDeleteDialogOpen(true);
  };

  const getStatusIcon = (status: TaskStatus) => {
    switch (status) {
      case TaskStatus.TODO:
        return <CircleIcon className="h-4 w-4 text-gray-500" />;
      case TaskStatus.IN_PROGRESS:
        return <ClockIcon className="h-4 w-4 text-blue-500" />;
      case TaskStatus.REVIEW:
        return <EyeIcon className="h-4 w-4 text-purple-500" />;
      case TaskStatus.DONE:
        return <CheckCircle2Icon className="h-4 w-4 text-green-500" />;
      default:
        return <CircleIcon className="h-4 w-4 text-gray-500" />;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'URGENT':
        return <Badge variant="destructive">Urgent</Badge>;
      case 'HIGH':
        return <Badge variant="outline" className="bg-orange-100 text-orange-800 hover:bg-orange-100">High</Badge>;
      case 'MEDIUM':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 hover:bg-blue-100">Medium</Badge>;
      case 'LOW':
        return <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">Low</Badge>;
      default:
        return <Badge variant="outline">{priority}</Badge>;
    }
  };
  
  const getSortIcon = (field: 'title' | 'status' | 'priority' | 'createdAt') => {
    if (sortBy !== field) {
      return <ArrowUpDownIcon className="h-4 w-4 text-muted-foreground" />;
    }
    
    return sortOrder === 'asc' 
      ? <ArrowUpIcon className="h-4 w-4" />
      : <ArrowDownIcon className="h-4 w-4" />;
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-2 mb-4 items-start sm:items-center">
        <div className="flex items-center gap-1">
          <FilterIcon size={16} />
          <span className="text-sm">Filter:</span>
        </div>

        <div className="flex flex-wrap gap-2">
          <Select
            value={priorityFilter || 'ALL_PRIORITIES'}
            onValueChange={(value) => setPriorityFilter(value === "ALL_PRIORITIES" ? null : value)}
          >
            <SelectTrigger className="w-[120px] h-8">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL_PRIORITIES">All Priorities</SelectItem>
              {Object.values(Priority).map((priority) => (
                <SelectItem key={priority} value={priority.toString()}>
                  {priority.charAt(0) + priority.slice(1).toLowerCase().replace('_', ' ')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={statusFilter || 'ALL_STATUSES'}
            onValueChange={(value) => setStatusFilter(value === "ALL_STATUSES" ? null : value)}
          >
            <SelectTrigger className="w-[120px] h-8">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL_STATUSES">All Statuses</SelectItem>
              {Object.values(TaskStatus).map((status) => (
                <SelectItem key={status} value={status.toString()}>
                  {status.replace('_', ' ')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={sortBy}
            onValueChange={(value) => handleSort(value as 'title' | 'status' | 'priority' | 'createdAt')}
          >
            <SelectTrigger className="w-[130px] h-8">
              <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
              <SelectItem value="createdAt">Created Date</SelectItem>
              <SelectItem value="title">Title</SelectItem>
              <SelectItem value="status">Status</SelectItem>
              <SelectItem value="priority">Priority</SelectItem>
          </SelectContent>
        </Select>

          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={toggleSortOrder}
            title={sortOrder === 'asc' ? 'Sort Ascending' : 'Sort Descending'}
          >
            {sortOrder === 'asc' ? <ArrowUpIcon className="h-4 w-4" /> : <ArrowDownIcon className="h-4 w-4" />}
          </Button>
        </div>
        
        <div className="ml-auto">
          <Button size="sm" asChild>
        <Link href={`/dashboard/tasks/new?projectId=${projectId}`}>
              Add Task
        </Link>
          </Button>
        </div>
      </div>

      {filteredTasks.length === 0 ? (
        <Card className="flex items-center justify-center p-8 text-center text-muted-foreground">
          {tasks.length === 0
            ? "No tasks found. Create your first task to get started."
            : "No tasks match the current filters."}
        </Card>
      ) : (
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Status</TableHead>
                <TableHead>
                  <Button 
                    variant="ghost" 
                    className="h-8 px-2 font-medium flex items-center gap-1"
                    onClick={() => handleSort('title')}
                  >
                    Title {getSortIcon('title')}
                  </Button>
                </TableHead>
                <TableHead>
                  <Button 
                    variant="ghost" 
                    className="h-8 px-2 font-medium flex items-center gap-1"
                    onClick={() => handleSort('priority')}
                  >
                    Priority {getSortIcon('priority')}
                  </Button>
                </TableHead>
                <TableHead>Assignee</TableHead>
                <TableHead>
                  <Button 
                    variant="ghost" 
                    className="h-8 px-2 font-medium flex items-center gap-1"
                    onClick={() => handleSort('createdAt')}
                  >
                    Created {getSortIcon('createdAt')}
                  </Button>
                </TableHead>
                <TableHead>Updated</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedTasks.map((task) => (
                <TableRow key={task.id}>
                  <TableCell>
                    <Select
                      value={task.status.toString()}
                      onValueChange={(value) => handleStatusChange(task.id, value)}
                    >
                      <SelectTrigger className="w-[140px] h-8">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(task.status)}
                          <span>
                            {task.status === TaskStatus.IN_PROGRESS
                              ? "In Progress"
                              : task.status.replace("_", " ")}
                          </span>
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        {Object.values(TaskStatus).map((status) => (
                          <SelectItem key={status} value={status.toString()}>
                          <div className="flex items-center gap-2">
                              {getStatusIcon(status as TaskStatus)}
                              <span>{status.replace('_', ' ')}</span>
                          </div>
                        </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Link
                      href={`/dashboard/tasks/${task.id}`}
                      className="font-medium hover:underline flex items-center gap-1"
                    >
                      {task.title}
                    </Link>
                  </TableCell>
                  <TableCell>
                    {getPriorityBadge(task.priority.toString())}
                  </TableCell>
                  <TableCell>
                    {task.assignedTo ? (
                      <div className="flex items-center gap-2">
                        <UserIcon className="h-4 w-4" />
                        <span>{task.assignedTo.name}</span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">Unassigned</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          {formatDistanceToNow(new Date(task.createdAt), {
                            addSuffix: true,
                          })}
                        </TooltipTrigger>
                        <TooltipContent>
                          {new Date(task.createdAt).toLocaleString()}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </TableCell>
                  <TableCell>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          {formatDistanceToNow(new Date(task.updatedAt), {
                            addSuffix: true,
                          })}
                        </TooltipTrigger>
                        <TooltipContent>
                          {new Date(task.updatedAt).toLocaleString()}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <span className="sr-only">Open menu</span>
                          <svg
                            width="15"
                            height="15"
                            viewBox="0 0 15 15"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                          >
                            <path
                              d="M8.625 2.5C8.625 3.12132 8.12132 3.625 7.5 3.625C6.87868 3.625 6.375 3.12132 6.375 2.5C6.375 1.87868 6.87868 1.375 7.5 1.375C8.12132 1.375 8.625 1.87868 8.625 2.5ZM8.625 7.5C8.625 8.12132 8.12132 8.625 7.5 8.625C6.87868 8.625 6.375 8.12132 6.375 7.5C6.375 6.87868 6.87868 6.375 7.5 6.375C8.12132 6.375 8.625 6.87868 8.625 7.5ZM7.5 13.625C8.12132 13.625 8.625 13.1213 8.625 12.5C8.625 11.8787 8.12132 11.375 7.5 11.375C6.87868 11.375 6.375 11.8787 6.375 12.5C6.375 13.1213 6.87868 13.625 7.5 13.625Z"
                              fill="currentColor"
                              fillRule="evenodd"
                              clipRule="evenodd"
                            ></path>
                          </svg>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link href={`/dashboard/tasks/${task.id}`}>
                            <ExternalLinkIcon className="h-4 w-4 mr-2" />
                            View
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/dashboard/tasks/${task.id}/edit`}>
                            <PencilIcon className="h-4 w-4 mr-2" />
                            Edit
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => openDeleteDialog(task.id)}
                        >
                          <TrashIcon className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this task. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
} 