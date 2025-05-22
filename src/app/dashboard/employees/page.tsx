import { Metadata } from "next";
import { EmployeesList } from "@/components/employees/employees-list";
import { getEmployees } from "@/lib/actions/employee-actions";

export const metadata: Metadata = {
  title: "Employees | Blurr HR Portal",
  description: "Manage employees in your organization",
};

export default async function EmployeesPage() {
  const { employees } = await getEmployees();
  
  return <EmployeesList employees={employees} />;
} 