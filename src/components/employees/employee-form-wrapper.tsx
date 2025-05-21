'use client';

import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { EmployeeForm } from './employee-form';
import { createEmployee } from '@/lib/actions/employee-actions';
import { EmployeeFormValues } from '@/types/employee';

export function EmployeeFormWrapper() {
  const router = useRouter();

  const handleSubmit = async (data: EmployeeFormValues) => {
    try {
      console.log('Submitting employee data:', data);
      console.log('joiningDate type:', data.joiningDate instanceof Date ? 'Date object' : typeof data.joiningDate);
      
      const result = await createEmployee(data);
      console.log('Server response:', result);
      
      // Show success toast
      toast.success("Employee created successfully", {
        description: `${data.name} has been added to the system.`,
      });
      
      // Redirect back to employees list
      router.push('/dashboard/employees');
    } catch (error) {
      console.error('Error submitting employee:', error);
      toast.error("Failed to create employee", {
        description: error instanceof Error ? error.message : "Please try again later.",
      });
    }
  };

  return <EmployeeForm onSubmit={handleSubmit} />;
} 