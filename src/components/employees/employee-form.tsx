'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Employee, EmployeeFormValues, employeeSchema } from '@/types/employee';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';

interface EmployeeFormProps {
  employee?: Employee;
  onSubmit: (data: EmployeeFormValues) => void;
}

export function EmployeeForm({ employee, onSubmit }: EmployeeFormProps) {
  const form = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeSchema),
    defaultValues: employee ? {
      employeeId: employee.employeeId,
      name: employee.name,
      joiningDate: employee.joiningDate,
      basicSalary: employee.basicSalary,
    } : {
      employeeId: '',
      name: '',
      joiningDate: new Date(),
      basicSalary: 0,
    },
  });

  const handleSubmit = (data: Record<string, unknown>) => {
    // Ensure data is properly formatted for submission
    const formattedData = {
      ...data,
      // joiningDate is already a Date object thanks to the onChange handler
      basicSalary: typeof data.basicSalary === 'string' 
        ? parseFloat(data.basicSalary) 
        : data.basicSalary,
    } as EmployeeFormValues;
    
    onSubmit(formattedData);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="employeeId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Employee ID</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Enter employee ID (e.g., EMP001)" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter employee name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="joiningDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Joining Date</FormLabel>
              <FormControl>
                <Input 
                  type="date" 
                  {...field} 
                  value={field.value instanceof Date 
                    ? field.value.toISOString().split('T')[0]
                    : field.value}
                  onChange={(e) => field.onChange(new Date(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="basicSalary"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Basic Salary</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  placeholder="Enter basic salary" 
                  {...field} 
                  onChange={(e) => field.onChange(
                    e.target.value === '' ? '' : Number(e.target.value)
                  )}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">{employee ? 'Update' : 'Create'} Employee</Button>
      </form>
    </Form>
  );
} 