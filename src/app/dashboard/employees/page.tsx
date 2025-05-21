import { Metadata } from "next";
import Link from "next/link";
import { getEmployees } from "@/lib/actions/employee-actions";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { formatDate, formatCurrency } from "@/lib/utils";
import { PlusIcon, Pencil2Icon, TrashIcon, EyeOpenIcon } from "@radix-ui/react-icons";

export const metadata: Metadata = {
  title: "Employees | Blurr HR Portal",
  description: "Manage employees in your organization",
};

export default async function EmployeesPage() {
  const { employees } = await getEmployees();

  return (
    <div className="container p-6">
      <div className="flex items-center justify-between mb-6 mx-auto ">
        <h1 className="text-3xl font-bold">Employees</h1>
        <Button asChild>
          <Link href="/dashboard/employees/new">
            <PlusIcon className="w-4 h-4 mr-2" />
            Add Employee
          </Link>
        </Button>
      </div>

      {employees.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-8 border rounded-lg bg-muted/10 mx-auto ">
          <h2 className="text-xl font-medium mb-2">No employees found</h2>
          <p className="text-muted-foreground mb-4">
            Get started by adding your first employee
          </p>
          <Button asChild>
            <Link href="/dashboard/employees/new">
              <PlusIcon className="w-4 h-4 mr-2" />
              Add Employee
            </Link>
          </Button>
        </div>
      ) : (
        <div className="border rounded-lg mx-auto ">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Joining Date</TableHead>
                <TableHead>Basic Salary</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employees.map((employee) => (
                <TableRow key={employee.id}>
                  <TableCell>{employee.employeeId}</TableCell>
                  <TableCell className="font-medium">{employee.name}</TableCell>
                  <TableCell>{formatDate(employee.joiningDate)}</TableCell>
                  <TableCell>{formatCurrency(employee.basicSalary)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="outline" size="icon" asChild title="View Employee Details">
                        <Link href={`/dashboard/employees/${employee.id}`}>
                          <EyeOpenIcon className="w-4 h-4" />
                        </Link>
                      </Button>
                      <Button variant="outline" size="icon" asChild title="Edit Employee">
                        <Link href={`/dashboard/employees/${employee.id}/edit`}>
                          <Pencil2Icon className="w-4 h-4" />
                        </Link>
                      </Button>
                      <Button variant="outline" size="icon" className="text-destructive" title="Delete Employee">
                        <TrashIcon className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
} 