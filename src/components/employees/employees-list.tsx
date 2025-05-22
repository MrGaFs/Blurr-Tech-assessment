'use client';

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { formatDate, formatCurrency } from "@/lib/utils";
import { PlusIcon, Pencil2Icon, TrashIcon, EyeOpenIcon } from "@radix-ui/react-icons";
import { 
  ArrowDownIcon, 
  ArrowUpIcon,
  ArrowUpDownIcon 
} from "lucide-react";

interface Employee {
  id: string;
  employeeId: string;
  name: string;
  joiningDate: Date | string;
  basicSalary: number;
}

interface EmployeesListProps {
  employees: Employee[];
}

type SortField = 'employeeId' | 'name' | 'joiningDate' | 'basicSalary';

export function EmployeesList({ employees }: EmployeesListProps) {
  const [sortBy, setSortBy] = useState<SortField>('employeeId');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };
  
  const handleSort = (field: SortField) => {
    if (sortBy === field) {
      toggleSortOrder();
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };
  
  const getSortIcon = (field: SortField) => {
    if (sortBy !== field) {
      return <ArrowUpDownIcon className="h-4 w-4 ml-1 text-muted-foreground" />;
    }
    
    return sortOrder === 'asc' 
      ? <ArrowUpIcon className="h-4 w-4 ml-1" />
      : <ArrowDownIcon className="h-4 w-4 ml-1" />;
  };
  
  const sortedEmployees = [...employees].sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'employeeId':
        comparison = a.employeeId.localeCompare(b.employeeId);
        break;
      case 'name':
        comparison = a.name.localeCompare(b.name);
        break;
      case 'joiningDate':
        comparison = new Date(a.joiningDate).getTime() - new Date(b.joiningDate).getTime();
        break;
      case 'basicSalary':
        comparison = a.basicSalary - b.basicSalary;
        break;
      default:
        comparison = 0;
    }
    
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  return (
    <div className="container p-6">
      <div className="flex items-center justify-between mb-6 mx-auto">
        <h1 className="text-3xl font-bold">Employees</h1>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <select 
              value={sortBy}
              onChange={(e) => handleSort(e.target.value as SortField)}
              className="text-sm border rounded py-1 px-2"
            >
              <option value="employeeId">Sort by ID</option>
              <option value="name">Sort by Name</option>
              <option value="joiningDate">Sort by Date</option>
              <option value="basicSalary">Sort by Salary</option>
            </select>
            <Button
              variant="outline"
              size="sm"
              onClick={toggleSortOrder}
              className="h-8 w-8 p-0"
              title={sortOrder === 'asc' ? 'Sort Ascending' : 'Sort Descending'}
            >
              {sortOrder === 'asc' ? <ArrowUpIcon className="h-4 w-4" /> : <ArrowDownIcon className="h-4 w-4" />}
            </Button>
          </div>
          <Button asChild>
            <Link href="/dashboard/employees/new">
              <PlusIcon className="w-4 h-4 mr-2" />
              Add Employee
            </Link>
          </Button>
        </div>
      </div>

      {sortedEmployees.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-8 border rounded-lg bg-muted/10 mx-auto">
          <h2 className="text-xl font-medium mb-2">No employees found</h2>
          <p className="text-muted-foreground mb-4">
            Get started by adding your first employee
          </p>
          <Button asChild>
            <Link href="/dashboard/employees/new">
              <PlusIcon className="w-4 h-4 mr-2" />
              Add Employee
            </Link>
          </Button>
        </div>
      ) : (
        <div className="border rounded-lg mx-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <Button 
                    variant="ghost" 
                    className="font-medium flex items-center p-0 hover:bg-transparent justify-start hover:underline"
                    onClick={() => handleSort('employeeId')}
                  >
                    Employee ID {getSortIcon('employeeId')}
                  </Button>
                </TableHead>
                <TableHead>
                  <Button 
                    variant="ghost" 
                    className="font-medium flex items-center p-0 hover:bg-transparent justify-start hover:underline"
                    onClick={() => handleSort('name')}
                  >
                    Name {getSortIcon('name')}
                  </Button>
                </TableHead>
                <TableHead>
                  <Button 
                    variant="ghost" 
                    className="font-medium flex items-center p-0 hover:bg-transparent justify-start hover:underline"
                    onClick={() => handleSort('joiningDate')}
                  >
                    Joining Date {getSortIcon('joiningDate')}
                  </Button>
                </TableHead>
                <TableHead>
                  <Button 
                    variant="ghost" 
                    className="font-medium flex items-center p-0 hover:bg-transparent justify-start hover:underline"
                    onClick={() => handleSort('basicSalary')}
                  >
                    Basic Salary {getSortIcon('basicSalary')}
                  </Button>
                </TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedEmployees.map((employee) => (
                <TableRow key={employee.id}>
                  <TableCell>{employee.employeeId}</TableCell>
                  <TableCell className="font-medium">{employee.name}</TableCell>
                  <TableCell>{formatDate(new Date(employee.joiningDate))}</TableCell>
                  <TableCell>{formatCurrency(employee.basicSalary)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="outline" size="icon" asChild title="View Employee Details">
                        <Link href={`/dashboard/employees/${employee.id}`}>
                          <EyeOpenIcon className="w-4 h-4" />
                        </Link>
                      </Button>
                      <Button variant="outline" size="icon" asChild title="Edit Employee">
                        <Link href={`/dashboard/employees/${employee.id}/edit`}>
                          <Pencil2Icon className="w-4 h-4" />
                        </Link>
                      </Button>
                      <Button variant="outline" size="icon" className="text-destructive" title="Delete Employee">
                        <TrashIcon className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
} 