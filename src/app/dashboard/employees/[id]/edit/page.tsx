import { Metadata } from "next";
import { notFound } from "next/navigation";

import { getEmployeeById } from "@/lib/actions/employee-actions";
import { EmployeeEditWrapper } from "@/components/employees/employee-edit-wrapper";

export const metadata: Metadata = {
  title: "Edit Employee | Blurr HR Portal",
  description: "Update employee information",
};

interface EditEmployeePageProps {
  params: {
    id: string;
  };
}

export default async function EditEmployeePage({ params }: EditEmployeePageProps) {
  const id = params.id;
  
  const { employee } = await getEmployeeById(id).catch(() => ({ employee: null }));

  if (!employee) {
    notFound();
  }

  return (
    <div className="container p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Edit Employee</h1>
        <p className="text-muted-foreground">
          Update employee information below.
        </p>
      </div>

      <div className="border rounded-lg p-6 bg-card">
        <EmployeeEditWrapper employee={employee} />
      </div>
    </div>
  );
} 