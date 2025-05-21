import { Metadata } from "next";
import { EmployeeFormWrapper } from "@/components/employees/employee-form-wrapper";

export const metadata: Metadata = {
  title: "Add Employee | Blurr HR Portal",
  description: "Add a new employee to your organization",
};

export default async function NewEmployeePage() {
  return (
    <div className="container p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Add New Employee</h1>
        <p className="text-muted-foreground">
          Fill in the form below to add a new employee to your organization.
        </p>
      </div>

      <div className="border rounded-lg p-6 bg-card">
        <EmployeeFormWrapper />
      </div>
    </div>
  );
} 