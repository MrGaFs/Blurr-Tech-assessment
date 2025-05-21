"use client";

import { useState, useEffect, useTransition } from "react";
import { format } from "date-fns";
import { formatCurrency, formatDate } from "@/lib/utils";
import { toast } from "sonner";
import { SalaryTableRecord, BulkSalaryUpdateFormValues } from "@/types/salary";

import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MonthPicker } from "./month-picker";
import { bulkUpdateSalaries } from "@/lib/actions/salary-actions";

interface SalaryTableProps {
  initialRecords: SalaryTableRecord[];
  initialMonth?: Date;
}

export function SalaryTable({ initialRecords, initialMonth = new Date() }: SalaryTableProps) {
  const [month, setMonth] = useState<Date>(initialMonth);
  const [records, setRecords] = useState<SalaryTableRecord[]>(initialRecords);
  const [isPending, startTransition] = useTransition();
  
  // When month changes, reset the records to the initial state
  useEffect(() => {
    setRecords(initialRecords);
  }, [initialRecords]);
  
  // Handle change in bonus or deduction
  const handleValueChange = (index: number, field: 'bonus' | 'deduction', value: number) => {
    const updatedRecords = [...records];
    const record = { ...updatedRecords[index] };
    
    // Update the specific field
    record[field] = value;
    
    // Recalculate the total amount
    record.totalAmount = record.basicSalary + record.bonus - record.deduction;
    
    // Mark as changed for styling and to track which records need updates
    record.changed = true;
    
    updatedRecords[index] = record;
    setRecords(updatedRecords);
  };
  
  // Save changes to bonuses and deductions
  const handleSaveChanges = () => {
    // Filter only records that have been changed
    const changedRecords = records.filter(record => record.changed);
    
    if (changedRecords.length === 0) {
      toast.info("No Changes", {
        description: "No changes were made to save.",
      });
      return;
    }
    
    startTransition(async () => {
      try {
        const data: BulkSalaryUpdateFormValues = {
          month,
          records: changedRecords.map(record => ({
            employeeId: record.employee.id,
            bonus: record.bonus,
            deduction: record.deduction,
          })),
        };
        
        await bulkUpdateSalaries(data);
        
        toast.success("Changes Saved", {
          description: `Successfully updated ${changedRecords.length} salary records.`,
        });
        
        // Remove the 'changed' flag from all records
        const updatedRecords = records.map(record => ({
          ...record,
          changed: false,
        }));
        
        setRecords(updatedRecords);
      } catch (error) {
        console.error("Failed to save changes:", error);
        toast.error("Operation Failed", {
          description: "There was an error saving your changes.",
        });
      }
    });
  };

  // Calculate total amount with bonus and deduction
  const calculateTotal = (record: SalaryTableRecord) => {
    return record.basicSalary + record.bonus - record.deduction;
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-lg font-medium">Salary Table</h2>
          <p className="text-sm text-muted-foreground">
            Manage employee salaries for {format(month, 'MMMM yyyy')}
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2">
          <MonthPicker 
            value={month} 
            onChange={(date) => {
              setMonth(date);
              window.location.href = `/dashboard/salary?month=${date.toISOString()}`;
            }} 
          />
        </div>
      </div>
      
      {records.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-8 border rounded-lg bg-muted/10">
          <h2 className="text-xl font-medium mb-2">No salary records</h2>
          <p className="text-muted-foreground mb-4">
            No salary records found for this month. Please select a different month.
          </p>
        </div>
      ) : (
        <>
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Joining Date</TableHead>
                  <TableHead>Basic Salary</TableHead>
                  <TableHead>Bonus</TableHead>
                  <TableHead>Deduction</TableHead>
                  <TableHead>Total Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {records.map((record, index) => (
                  <TableRow 
                    key={record.employeeId}
                    className={record.changed ? "bg-muted/50" : ""}
                  >
                    <TableCell>{record.employee.employeeId}</TableCell>
                    <TableCell className="font-medium">{record.employee.name}</TableCell>
                    <TableCell>{formatDate(record.joiningDate)}</TableCell>
                    <TableCell>{formatCurrency(record.basicSalary)}</TableCell>
                    <TableCell>
                      <Input 
                        type="number"
                        min="0"
                        value={record.bonus}
                        onChange={(e) => handleValueChange(index, 'bonus', Number(e.target.value))}
                        className="w-24 h-8"
                      />
                    </TableCell>
                    <TableCell>
                      <Input 
                        type="number"
                        min="0"
                        value={record.deduction}
                        onChange={(e) => handleValueChange(index, 'deduction', Number(e.target.value))}
                        className="w-24 h-8"
                      />
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatCurrency(calculateTotal(record))}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          <div className="flex justify-end">
            <Button 
              onClick={handleSaveChanges}
              disabled={isPending || !records.some(record => record.changed)}
            >
              {isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </>
      )}
    </div>
  );
} 