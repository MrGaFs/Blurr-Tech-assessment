'use client';

import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { EmployeeForm } from './employee-form';
import { updateEmployee } from '@/lib/actions/employee-actions';
import { EmployeeFormValues } from '@/types/employee';
import { Employee } from '@/types/employee';

interface EmployeeEditWrapperProps {
  employee: Employee;
}

export function EmployeeEditWrapper({ employee }: EmployeeEditWrapperProps) {
  const router = useRouter();

  const handleSubmit = async (data: EmployeeFormValues) => {
    try {
      await updateEmployee(employee.id, data);
      
      // Show success toast
      toast.success("Employee updated successfully", {
        description: `${data.name}'s information has been updated.`,
      });
      
      // Redirect back to employee details
      router.push(`/dashboard/employees/${employee.id}`);
    } catch (error) {
      console.error('Error updating employee:', error);
      toast.error("Failed to update employee", {
        description: error instanceof Error ? error.message : "Please try again later.",
      });
    }
  };

  return <EmployeeForm employee={employee} onSubmit={handleSubmit} />;
} 