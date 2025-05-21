import { Metadata } from "next";
import { startOfMonth, endOfMonth, isBefore, isEqual } from "date-fns";
import { getEmployees } from "@/lib/actions/employee-actions";
import { getSalaryRecordsByMonth } from "@/lib/actions/salary-actions";
import { SalaryTable } from "@/components/salary/salary-table";
import { SalaryTableRecord } from "@/types/salary";

export const metadata: Metadata = {
  title: "Salary Management | Blurr HR Portal",
  description: "Manage employee salaries",
};

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function SalaryPage( {searchParams} : PageProps) {
  // Get the requested month from the URL or use current month
  let selectedMonth: Date;
  
  // Safely extract the month parameter with proper handling
  const { month: monthParam } = await searchParams;
  
  // Process the month parameter if it exists and is a string
  if (typeof monthParam === 'string') {
    try {
      selectedMonth = new Date(monthParam);
      if (isNaN(selectedMonth.getTime())) {
        selectedMonth = startOfMonth(new Date());
      }
    } catch {
      selectedMonth = startOfMonth(new Date());
    }
  } else {
    selectedMonth = startOfMonth(new Date());
  }

  // Get the end of the selected month for comparison
  const selectedMonthEnd = endOfMonth(selectedMonth);

  // Get all employees and salary records for the month
  const { employees } = await getEmployees();
  const { salaryRecords } = await getSalaryRecordsByMonth(selectedMonth);

  // Filter employees who had joined by the end of the selected month
  const eligibleEmployees = employees.filter(employee => {
    // Convert joining date to start of day for accurate comparison
    const joiningDate = new Date(employee.joiningDate);
    // Employee is eligible if they joined on or before the end of the selected month
    return isBefore(joiningDate, selectedMonthEnd) || isEqual(joiningDate, selectedMonthEnd);
  });

  // Map salary records to eligible employees
  const tableRecords: SalaryTableRecord[] = eligibleEmployees.map(employee => {
    const salaryRecord = salaryRecords.find(
      record => record.employeeId === employee.id
    );

    return {
      employeeId: employee.employeeId,
      employee: {
        id: employee.id,
        employeeId: employee.employeeId,
        name: employee.name,
      },
      joiningDate: employee.joiningDate,
      basicSalary: salaryRecord?.basicSalary ?? employee.basicSalary,
      bonus: salaryRecord?.bonus ?? 0,
      deduction: salaryRecord?.deduction ?? 0,
      totalAmount: salaryRecord?.totalAmount ?? employee.basicSalary,
      salaryRecord: salaryRecord,
      changed: false,
    };
  });

  return (
    <div className="container p-6">
      <div className="flex items-center justify-between mb-6 mx-auto max-w-6xl">
        <h1 className="text-3xl font-bold">Salary Management</h1>
      </div>

      <div className="mx-auto max-w-6xl">
        <SalaryTable
          initialRecords={tableRecords}
          initialMonth={selectedMonth}
        />
      </div>
    </div>
  );
} 