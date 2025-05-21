import { z } from "zod";
import { SalaryRecord } from "./employee";

// Schema for creating or updating a salary record
export const salaryRecordSchema = z.object({
  employeeId: z.string().min(1, "Employee ID is required"),
  month: z.date({
    required_error: "Month is required",
  }),
  basicSalary: z.number().min(0, "Basic salary cannot be negative"),
  bonus: z.number().min(0, "Bonus cannot be negative").default(0),
  deduction: z.number().min(0, "Deduction cannot be negative").default(0),
});

export const bulkSalaryUpdateSchema = z.object({
  month: z.date({
    required_error: "Month is required",
  }),
  records: z.array(
    z.object({
      employeeId: z.string(),
      bonus: z.number().min(0).default(0),
      deduction: z.number().min(0).default(0),
    })
  ),
});

export type SalaryRecordFormValues = z.infer<typeof salaryRecordSchema>;
export type BulkSalaryUpdateFormValues = z.infer<typeof bulkSalaryUpdateSchema>;

// Extended type that includes employee details with the salary record
export type SalaryTableRecord = {
  employeeId: string;
  employee: {
    id: string;
    employeeId: string;
    name: string;
  };
  joiningDate: Date;
  salaryRecord?: SalaryRecord;
  basicSalary: number;
  bonus: number;
  deduction: number;
  totalAmount: number;
  changed?: boolean;
};

// Type for the monthly filter
export type MonthFilter = {
  month: number;
  year: number;
}; 