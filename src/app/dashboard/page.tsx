import { auth } from "@/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getEmployees } from "@/lib/actions/employee-actions";
import { getSalaryRecordsByMonth } from "@/lib/actions/salary-actions"; 
import { getProjects, getTaskStatusSummary } from "@/lib/actions/project-actions";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { UsersIcon, BriefcaseIcon, ListChecksIcon } from "lucide-react";

export default async function DashboardPage() {
  const session = await auth();
  
  // Get employees data
  const { employees } = await getEmployees().catch(() => ({ employees: [] }));
  
  // Get current month salary records
  const currentMonth = new Date();
  const { salaryRecords } = await getSalaryRecordsByMonth(currentMonth)
    .catch(() => ({ salaryRecords: [] }));
  
  // Get projects data
  const { projects } = await getProjects().catch(() => ({ projects: [] }));
  
  // Get task status summary
  const { statusCounts } = await getTaskStatusSummary()
    .catch(() => ({ statusCounts: {} as Record<string, number> }));
  
  // Calculate metrics
  const totalEmployees = employees.length;
  const totalProjects = projects.length;
  const totalTasks = Object.values(statusCounts).reduce((sum, count) => sum + count, 0);
  const completedTasks = statusCounts['DONE'] || 0;
  const tasksInProgress = statusCounts['IN_PROGRESS'] || 0;
  const pendingTasks = statusCounts['TODO'] || 0;
  
  // Calculate average salary if there are employees
  const averageSalary = employees.length > 0 
    ? employees.reduce((sum, emp) => sum + emp.basicSalary, 0) / employees.length 
    : 0;

  return (
    <div className="container p-6">
      <h1 className="text-3xl font-bold mb-6">Dashboard Overview</h1>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card className="border shadow-sm bg-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Employees</p>
                <p className="text-3xl font-bold">{totalEmployees}</p>
              </div>
              <div className="rounded-full bg-background p-3 border">
                <UsersIcon className="h-6 w-6 text-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border shadow-sm bg-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Projects</p>
                <p className="text-3xl font-bold">{totalProjects}</p>
              </div>
              <div className="rounded-full bg-background p-3 border">
                <BriefcaseIcon className="h-6 w-6 text-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border shadow-sm bg-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Tasks</p>
                <p className="text-3xl font-bold">{totalTasks}</p>
              </div>
              <div className="rounded-full bg-background p-3 border">
                <ListChecksIcon className="h-6 w-6 text-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Detailed Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Welcome {session?.user?.name || "User"}!</CardTitle>
            <CardDescription>You&apos;re logged in with {session?.user?.email}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">Access employee information and manage salaries.</p>
            <div className="flex flex-col space-y-2">
              <Button asChild variant="outline" size="sm">
                <Link href="/dashboard/employees">Manage Employees</Link>
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link href="/dashboard/salary">Salary Management</Link>
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link href="/dashboard/projects">Manage Projects</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Employee Stats</CardTitle>
            <CardDescription>Real-time employee data</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Total Employees</p>
                <p className="text-3xl font-semibold">{employees.length}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Average Salary</p>
                <p className="text-2xl font-semibold">{formatCurrency(averageSalary)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Salary Records</p>
                <p className="text-xl font-semibold">{salaryRecords.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Task Status</CardTitle>
            <CardDescription>Real-time task progress</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground">Completed</p>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-foreground/80"></div>
                  <p className="font-semibold">{completedTasks}</p>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground">In Progress</p>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-foreground/60"></div>
                  <p className="font-semibold">{tasksInProgress}</p>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground">To Do</p>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-foreground/40"></div>
                  <p className="font-semibold">{pendingTasks}</p>
                </div>
              </div>
              <div className="mt-2 pt-2 border-t">
                <div className="flex justify-between items-center">
                  <p className="text-sm font-medium">Total</p>
                  <p className="font-semibold">{totalTasks}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 