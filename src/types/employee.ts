import { z } from "zod";

export const employeeSchema = z.object({
  employeeId: z.string().min(1, "Employee ID is required"),
  name: z.string().min(1, "Name is required"),
  joiningDate: z.date({
    required_error: "Joining date is required",
  }),
  basicSalary: z.number().min(0, "Salary cannot be negative"),
});

export type EmployeeFormValues = z.infer<typeof employeeSchema>;

export type Employee = {
  id: string;
  employeeId: string;
  name: string;
  joiningDate: Date;
  basicSalary: number;
  createdAt?: Date;
  updatedAt?: Date;
};

export type SalaryRecord = {
  id: string;
  employeeId: string;
  month: Date;
  basicSalary: number;
  bonus: number;
  deduction: number;
  totalAmount: number;
  createdAt: Date;
  updatedAt: Date;
}; 