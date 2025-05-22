"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { EmployeeFormValues } from "@/types/employee";

export async function getEmployees() {
  try {
    const employees = await db.employee.findMany({
      orderBy: {
        name: "asc",
      },
    });
    
    return { employees };
  } catch (error) {
    console.error("Failed to fetch employees:", error);
    throw new Error("Failed to fetch employees");
  }
}

export async function getEmployeeById(id: string) {
  try {
    const employee = await db.employee.findUnique({
      where: { id },
      include: {
        tasks: true,
      },
    });
    
    if (!employee) {
      throw new Error("Employee not found");
    }
    
    return { employee };
  } catch (error) {
    console.error(`Failed to fetch employee with ID ${id}:`, error);
    throw new Error("Failed to fetch employee");
  }
}

export async function createEmployee(data: EmployeeFormValues) {
  try {
    console.log("Server received data:", {
      employeeId: data.employeeId,
      name: data.name,
      joiningDate: data.joiningDate instanceof Date ? 'Date object' : typeof data.joiningDate,
      basicSalary: data.basicSalary
    });
    
    // Ensure joiningDate is a Date object
    const joiningDate = data.joiningDate instanceof Date 
      ? data.joiningDate 
      : new Date(data.joiningDate);
    
    const employee = await db.employee.create({
      data: {
        employeeId: data.employeeId,
        name: data.name,
        joiningDate,
        basicSalary: data.basicSalary,
      },
    });
    
    revalidatePath("/dashboard/employees");
    return { employee };
  } catch (error) {
    console.error("Failed to create employee:", error);
    if (error instanceof Error) {
      throw new Error(`Failed to create employee: ${error.message}`);
    }
    throw new Error("Failed to create employee: Unknown error");
  }
}

export async function updateEmployee(id: string, data: EmployeeFormValues) {
  try {
    console.log("Update employee received data:", {
      id,
      employeeId: data.employeeId,
      name: data.name,
      joiningDate: data.joiningDate instanceof Date ? 'Date object' : typeof data.joiningDate,
      basicSalary: data.basicSalary
    });
    
    // Ensure joiningDate is a Date object
    const joiningDate = data.joiningDate instanceof Date 
      ? data.joiningDate 
      : new Date(data.joiningDate);
    
    const employee = await db.employee.update({
      where: { id },
      data: {
        employeeId: data.employeeId,
        name: data.name,
        joiningDate,
        basicSalary: data.basicSalary,
      },
    });
    
    revalidatePath(`/dashboard/employees/${id}`);
    revalidatePath("/dashboard/employees");
    return { employee };
  } catch (error) {
    console.error(`Failed to update employee with ID ${id}:`, error);
    if (error instanceof Error) {
      throw new Error(`Failed to update employee: ${error.message}`);
    }
    throw new Error("Failed to update employee: Unknown error");
  }
}

export async function deleteEmployee(id: string) {
  try {
    await db.employee.delete({
      where: { id },
    });
    
    revalidatePath("/dashboard/employees");
    return { success: true };
  } catch (error) {
    console.error(`Failed to delete employee with ID ${id}:`, error);
    throw new Error("Failed to delete employee");
  }
} 