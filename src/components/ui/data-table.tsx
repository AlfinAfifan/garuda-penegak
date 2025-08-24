'use client';

import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Users, LucideIcon, Loader2Icon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export type ColumnDef<T> = {
  header: string | React.ReactNode | ((props?: any) => React.ReactNode);
  accessor?: keyof T | string;
  cell?: (item: T) => React.ReactNode;
  className?: string;
  id?: string | number;
  enableSorting?: boolean;
  enableHiding?: boolean;
};

interface DataTableProps<T> {
  columns: ColumnDef<T>[];
  data: T[];
  keyField: keyof T;
  emptyMessage?: {
    title?: string;
    description?: string;
    buttonText?: string;
    onButtonClick?: () => void;
    icon?: LucideIcon;
  };
  isLoading?: boolean;
  tableProps?: any;
}

export function DataTable<T>({
  columns,
  data,
  keyField,
  emptyMessage = {
    title: 'No data found',
    description: 'Add your first item to get started',
    buttonText: 'Add Item',
    icon: Users,
  },
  isLoading = false,
  tableProps,
}: DataTableProps<T>) {
  const renderHeader = (column: ColumnDef<T>) => {
    if (typeof column.header === 'function') {
      return column.header(tableProps);
    }
    if (React.isValidElement(column.header)) {
      return column.header;
    }
    return column.header;
  };

  // Function to get the cell value based on accessor
  const getCellValue = (item: T, accessor: string) => {
    const column = columns.find((col) => col.accessor === accessor);

    if (column?.cell) {
      return column.cell(item);
    }

    if (accessor.includes('.')) {
      return accessor.split('.').reduce((obj, key) => obj && (obj as any)[key], item);
    }

    return (item as any)[accessor];
  };

  const EmptyIcon = emptyMessage.icon || Users;

  // Loading state
  if (isLoading) {
    return (
      <Table>
        <TableHeader>
          <TableRow>
            {columns?.map((column, index) => (
              <TableHead key={column.id || (column.accessor as string) || `header-${index}`} className={column.className}>
                {renderHeader(column)}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell colSpan={columns?.length} className="text-center py-10">
              <div className="flex flex-col items-center">
                <Loader2Icon className="animate-spin" />
                <p className="text-muted-foreground">Loading...</p>
              </div>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );
  }

  // Check if data is empty
  if (data?.length === 0) {
    return (
      <Table>
        <TableHeader>
          <TableRow>
            {columns?.map((column, index) => (
              <TableHead key={column.id || (column.accessor as string) || `header-${index}`} className={column.className}>
                {renderHeader(column)}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell colSpan={columns?.length} className="text-center py-10 text-muted-foreground">
              <div className="flex flex-col items-center">
                <EmptyIcon className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-1">{emptyMessage.title}</h3>
                <p className="text-muted-foreground mb-4">{emptyMessage.description}</p>
                {emptyMessage.buttonText && emptyMessage.onButtonClick && (
                  <Button className="bg-primary-500 hover:bg-primary-600 text-white flex items-center gap-2 transition-all duration-200" onClick={emptyMessage.onButtonClick}>
                    <Plus className="mr-2 h-4 w-4" />
                    {emptyMessage.buttonText}
                  </Button>
                )}
              </div>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );
  }

  // Main table rendering - No pagination, show all data
  return (
    <Table>
      <TableHeader>
        <TableRow>
          {columns?.map((column, index) => (
            <TableHead key={column.id || (column.accessor as string) || `header-${index}`} className={column.className}>
              {renderHeader(column)}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {data?.map((item) => (
          <TableRow key={String(item[keyField])}>
            {columns?.map((column, index) => (
              <TableCell key={`${String(item[keyField])}-${column.id || (column.accessor as string) || index}`} className={column.className}>
                {column.cell ? column.cell(item) : getCellValue(item, column.accessor as string)}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export interface Row<T> {
  original: T;
  getIsSelected?: () => boolean;
  toggleSelected?: (selected?: boolean) => void;
}
