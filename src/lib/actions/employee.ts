'use server';

import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';

// Added function to get or create default organization
async function getOrCreateDefaultOrganization() {
  // Try to find an existing organization
  let organization = await db.organization.findFirst();
  
  // If no organization exists, create one
  if (!organization) {
    organization = await db.organization.create({
      data: {
        name: 'Default Organization',
      },
    });
  }
  
  return organization;
}

export async function getEmployees() {
  try {
    const employees = await db.employee.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
    return { data: employees };
  } catch (err) {
    return { error: `Failed to fetch employees: ${err}` };
  }
}

export async function createEmployee(data: {
  name: string;
  joiningDate: string;
  basicSalary: string;
}) {
  try {
    // Get or create default organization
    const organization = await getOrCreateDefaultOrganization();
    
    const employee = await db.employee.create({
      data: {
        name: data.name,
        joiningDate: new Date(data.joiningDate),
        basicSalary: parseFloat(data.basicSalary),
        employeeId: `EMP${Date.now()}`,
        organizationId: organization.id,
      },
    });
    revalidatePath('/dashboard/employees');
    return { data: employee };
  } catch (error) {
    console.error('Error creating employee:', error);
    return { error: 'Failed to create employee' };
  }
}

export async function updateEmployee(
  id: string,
  data: {
    name: string;
    joiningDate: string;
    basicSalary: string;
  }
) {
  try {
    const employee = await db.employee.update({
      where: { id },
      data: {
        name: data.name,
        joiningDate: new Date(data.joiningDate),
        basicSalary: parseFloat(data.basicSalary),
      },
    });
    revalidatePath('/dashboard/employees');
    return { data: employee };
  } catch (error) {
    return { error: `Failed to update employee: ${error}` };
  }
}

export async function deleteEmployee(id: string) {
  try {
    await db.employee.delete({
      where: { id },
    });
    revalidatePath('/dashboard/employees');
    return { data: null };
  } catch (error) {
    return { error: `Failed to delete employee: ${error}` };
  }
} 