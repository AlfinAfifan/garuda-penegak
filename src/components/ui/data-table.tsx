'use client';

import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowUpDown, ChevronDown, ChevronUp, Loader2Icon, LucideIcon, Users } from 'lucide-react';
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

type SortDirection = 'asc' | 'desc';

type SortState = {
  accessor: string;
  direction: SortDirection;
} | null;

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
  const [sortState, setSortState] = React.useState<SortState>(null);

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

  const getSortableValue = React.useCallback(
    (item: T, accessor: string) => {
      const value = getCellValue(item, accessor);

      if (value === null || value === undefined) {
        return '';
      }

      if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
        return value;
      }

      if (value instanceof Date) {
        return value.getTime();
      }

      return String(value);
    },
    [columns],
  );

  const sortedData = React.useMemo(() => {
    if (!sortState) {
      return data;
    }

    const sorted = [...data].sort((a, b) => {
      const aValue = getSortableValue(a, sortState.accessor);
      const bValue = getSortableValue(b, sortState.accessor);

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortState.direction === 'asc' ? aValue - bValue : bValue - aValue;
      }

      const aString = String(aValue).toLowerCase();
      const bString = String(bValue).toLowerCase();
      const comparison = aString.localeCompare(bString, undefined, { numeric: true, sensitivity: 'base' });

      return sortState.direction === 'asc' ? comparison : -comparison;
    });

    return sorted;
  }, [data, getSortableValue, sortState]);

  const getNextSortState = (column: ColumnDef<T>): SortState => {
    const accessor = String(column.accessor);

    if (!sortState || sortState.accessor !== accessor) {
      return { accessor, direction: 'asc' };
    }

    if (sortState.direction === 'asc') {
      return { accessor, direction: 'desc' };
    }

    return null;
  };

  const renderSortIcon = (column: ColumnDef<T>) => {
    const accessor = String(column.accessor);

    if (!sortState || sortState.accessor !== accessor) {
      return <ArrowUpDown className="ml-2 h-4 w-4" />;
    }

    if (sortState.direction === 'asc') {
      return <ChevronUp className="ml-2 h-4 w-4" />;
    }

    return <ChevronDown className="ml-2 h-4 w-4" />;
  };

  const renderHeaderCell = (column: ColumnDef<T>) => {
    const canSort = Boolean(column.accessor) && column.enableSorting !== false;

    if (!canSort) {
      return renderHeader(column);
    }

    return (
      <Button variant="ghost" className="h-auto p-0 font-medium hover:bg-transparent" onClick={() => setSortState(getNextSortState(column))}>
        {renderHeader(column)}
        {renderSortIcon(column)}
      </Button>
    );
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
                {renderHeaderCell(column)}
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
                {renderHeaderCell(column)}
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
              {renderHeaderCell(column)}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {sortedData?.map((item) => (
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
