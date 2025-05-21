"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { SalaryRecordFormValues, BulkSalaryUpdateFormValues } from "@/types/salary";
import { startOfMonth, endOfMonth } from "date-fns";

/**
 * Get all salary records for a specific month
 */
export async function getSalaryRecordsByMonth(month: Date) {
  try {
    const startDate = startOfMonth(month);
    const endDate = endOfMonth(month);

    const salaryRecords = await db.salaryRecord.findMany({
      where: {
        month: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        employee: {
          select: {
            id: true,
            employeeId: true,
            name: true,
          },
        },
      },
      orderBy: {
        employee: {
          name: "asc",
        },
      },
    });

    return { salaryRecords };
  } catch (error) {
    console.error("Failed to fetch salary records:", error);
    throw new Error("Failed to fetch salary records");
  }
}

/**
 * Get salary records for a specific employee
 */
export async function getEmployeeSalaryRecords(employeeId: string) {
  try {
    const salaryRecords = await db.salaryRecord.findMany({
      where: { employeeId },
      orderBy: {
        month: "desc",
      },
    });

    return { salaryRecords };
  } catch (error) {
    console.error(`Failed to fetch salary records for employee ${employeeId}:`, error);
    throw new Error("Failed to fetch employee salary records");
  }
}

/**
 * Create a new salary record
 */
export async function createSalaryRecord(data: SalaryRecordFormValues) {
  try {
    // Calculate total amount
    const totalAmount = data.basicSalary + data.bonus - data.deduction;

    // Check if a record already exists for this employee and month
    const startDate = startOfMonth(data.month);
    const endDate = endOfMonth(data.month);

    const existingRecord = await db.salaryRecord.findFirst({
      where: {
        employeeId: data.employeeId,
        month: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    if (existingRecord) {
      throw new Error("A salary record already exists for this employee and month");
    }

    const salaryRecord = await db.salaryRecord.create({
      data: {
        employeeId: data.employeeId,
        month: data.month,
        basicSalary: data.basicSalary,
        bonus: data.bonus,
        deduction: data.deduction,
        totalAmount,
      },
    });

    revalidatePath("/dashboard/salary");
    return { salaryRecord };
  } catch (error) {
    console.error("Failed to create salary record:", error);
    throw error;
  }
}

/**
 * Update an existing salary record
 */
export async function updateSalaryRecord(id: string, data: Partial<SalaryRecordFormValues>) {
  try {
    // Get the current record to calculate the new total amount
    const currentRecord = await db.salaryRecord.findUnique({
      where: { id },
    });

    if (!currentRecord) {
      throw new Error("Salary record not found");
    }

    // Use current values for any missing fields
    const basicSalary = data.basicSalary ?? currentRecord.basicSalary;
    const bonus = data.bonus ?? currentRecord.bonus;
    const deduction = data.deduction ?? currentRecord.deduction;
    const totalAmount = basicSalary + bonus - deduction;

    const salaryRecord = await db.salaryRecord.update({
      where: { id },
      data: {
        ...data,
        totalAmount,
      },
    });

    revalidatePath("/dashboard/salary");
    return { salaryRecord };
  } catch (error) {
    console.error(`Failed to update salary record ${id}:`, error);
    throw error;
  }
}

/**
 * Delete a salary record
 */
export async function deleteSalaryRecord(id: string) {
  try {
    await db.salaryRecord.delete({
      where: { id },
    });

    revalidatePath("/dashboard/salary");
    return { success: true };
  } catch (error) {
    console.error(`Failed to delete salary record ${id}:`, error);
    throw new Error("Failed to delete salary record");
  }
}

/**
 * Generate or update salary records for all employees in a specific month
 */
export async function generateMonthlySalaries(month: Date) {
  try {
    // Get all employees
    const employees = await db.employee.findMany();
    const startDate = startOfMonth(month);
    const endDate = endOfMonth(month);

    // Create or update salary records for each employee
    const results = await Promise.all(
      employees.map(async (employee) => {
        // Check if a record already exists
        const existingRecord = await db.salaryRecord.findFirst({
          where: {
            employeeId: employee.id,
            month: {
              gte: startDate,
              lte: endDate,
            },
          },
        });

        if (existingRecord) {
          // Record exists, update only if basicSalary has changed
          if (existingRecord.basicSalary !== employee.basicSalary) {
            return db.salaryRecord.update({
              where: { id: existingRecord.id },
              data: {
                basicSalary: employee.basicSalary,
                totalAmount: employee.basicSalary + existingRecord.bonus - existingRecord.deduction,
              },
            });
          }
          return existingRecord;
        } else {
          // Create new record
          return db.salaryRecord.create({
            data: {
              employeeId: employee.id,
              month: startDate,
              basicSalary: employee.basicSalary,
              bonus: 0,
              deduction: 0,
              totalAmount: employee.basicSalary,
            },
          });
        }
      })
    );

    revalidatePath("/dashboard/salary");
    return { count: results.length };
  } catch (error) {
    console.error("Failed to generate monthly salaries:", error);
    throw new Error("Failed to generate monthly salaries");
  }
}

/**
 * Bulk update salary records for a specific month
 */
export async function bulkUpdateSalaries(data: BulkSalaryUpdateFormValues) {
  try {
    const { month, records } = data;
    const startDate = startOfMonth(month);
    const endDate = endOfMonth(month);

    // Process each record in the bulk update
    const results = await Promise.all(
      records.map(async (record) => {
        // Find the existing salary record
        const existingRecord = await db.salaryRecord.findFirst({
          where: {
            employee: {
              id: record.employeeId,
            },
            month: {
              gte: startDate,
              lte: endDate,
            },
          },
          include: {
            employee: true,
          },
        });

        if (existingRecord) {
          // Update existing record
          const totalAmount = 
            existingRecord.basicSalary + record.bonus - record.deduction;
          
          return db.salaryRecord.update({
            where: { id: existingRecord.id },
            data: {
              bonus: record.bonus,
              deduction: record.deduction,
              totalAmount,
            },
          });
        } else {
          // Get employee info to create a new record
          const employee = await db.employee.findUnique({
            where: { id: record.employeeId },
          });

          if (!employee) {
            throw new Error(`Employee not found: ${record.employeeId}`);
          }

          const totalAmount = employee.basicSalary + record.bonus - record.deduction;
          
          return db.salaryRecord.create({
            data: {
              employeeId: employee.id,
              month: startDate,
              basicSalary: employee.basicSalary,
              bonus: record.bonus,
              deduction: record.deduction,
              totalAmount,
            },
          });
        }
      })
    );

    revalidatePath("/dashboard/salary");
    return { count: results.length };
  } catch (error) {
    console.error("Failed to bulk update salaries:", error);
    throw error;
  }
} 