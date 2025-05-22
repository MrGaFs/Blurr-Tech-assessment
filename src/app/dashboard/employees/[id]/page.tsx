import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getEmployeeById } from "@/lib/actions/employee-actions";
import { Button } from "@/components/ui/button";
import { Pencil2Icon, TrashIcon } from "@radix-ui/react-icons";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate, formatCurrency } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Employee Details | Blurr HR Portal",
  description: "View employee details",
};

interface EmployeePageProps {
    id: string;
}

export default async function EmployeePage(
   {params} :  {params: Promise<EmployeePageProps>} ) {
  const  id  = (await params).id;
  const { employee } = await getEmployeeById(id).catch(() => {
    return { employee: null };
  });

  if (!employee) {
    notFound();
  }

  return (
    <div className="container p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">{employee.name}</h1>
          <p className="text-muted-foreground">Employee ID: {employee.employeeId}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            asChild
            title="Edit employee information"
          >
            <Link href={`/dashboard/employees/${employee.id}/edit`}>
              <Pencil2Icon className="w-4 h-4 mr-2" />
              Edit
            </Link>
          </Button>
          <Button variant="destructive" title="Permanently delete this employee">
            <TrashIcon className="w-4 h-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Employee personal details</CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="space-y-4">
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Name</dt>
                <dd className="text-lg">{employee.name}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Employee ID</dt>
                <dd className="text-lg">{employee.employeeId}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Joining Date</dt>
                <dd className="text-lg">{formatDate(employee.joiningDate)}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Salary Information</CardTitle>
            <CardDescription>Employee salary details</CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="space-y-4">
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Basic Salary</dt>
                <dd className="text-lg">{formatCurrency(employee.basicSalary)}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Assigned Tasks</CardTitle>
            <CardDescription>Tasks assigned to this employee</CardDescription>
          </CardHeader>
          <CardContent>
            {employee.tasks.length === 0 ? (
              <p className="text-muted-foreground">No tasks assigned to this employee.</p>
            ) : (
              <div className="border rounded-lg">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="py-2 px-4 text-left">Title</th>
                      <th className="py-2 px-4 text-left">Priority</th>
                      <th className="py-2 px-4 text-left">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {employee.tasks.map((task) => (
                      <tr
                        key={task.id}
                        className="border-b"
                      >
                        <td className="py-2 px-4">{task.title}</td>
                        <td className="py-2 px-4">
                          <span
                            className={`inline-block px-2 py-1 rounded-full text-xs ${
                              task.priority === "LOW"
                                ? "bg-green-100 text-green-800"
                                : task.priority === "MEDIUM"
                                ? "bg-blue-100 text-blue-800"
                                : task.priority === "HIGH"
                                ? "bg-orange-100 text-orange-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {task.priority}
                          </span>
                        </td>
                        <td className="py-2 px-4">
                          <span
                            className={`inline-block px-2 py-1 rounded-full text-xs ${
                              task.status === "TODO"
                                ? "bg-gray-100 text-gray-800"
                                : task.status === "IN_PROGRESS"
                                ? "bg-blue-100 text-blue-800"
                                : task.status === "REVIEW"
                                ? "bg-purple-100 text-purple-800"
                                : "bg-green-100 text-green-800"
                            }`}
                          >
                            {task.status.replace("_", " ")}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}