import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import React, { useEffect } from 'react';

interface SearchableSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  options: Array<{ _id: number | string; name: string; description?: string }>;
  isLoading?: boolean;
  placeholder?: string;
  searchValue: string;
  onSearchChange: (value: string) => void;
  disabled?: boolean;
  error?: boolean;
  className?: string;
}

export function SearchableSelect({ value, onValueChange, options, isLoading, placeholder = 'Select option', searchValue, onSearchChange, disabled, error, className }: SearchableSelectProps) {
  const currentValue = value ? String(value) : '';

  return (
    <Select value={currentValue} onValueChange={onValueChange} disabled={disabled}>
      <SelectTrigger className={['w-full', error ? 'border-red-500' : '', className].filter(Boolean).join(' ')}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {/* Search Input */}
        <div className="flex items-center px-3 py-2">
          <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
          <Input
            placeholder="Search..."
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            className="h-8 w-full border-none shadow-none focus:ring-0 focus-visible:ring-0 bg-transparent"
            onPointerDown={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
          />
        </div>
        {/* Options */}
        <div className="max-h-64 overflow-auto">
          {isLoading ? (
            <div className="py-2 px-3 text-sm text-muted-foreground">Loading...</div>
          ) : options?.length === 0 ? (
            <div className="py-2 px-3 text-sm text-muted-foreground">No data found</div>
          ) : (
            options
              ?.filter((option: any) => option._id !== undefined && option._id !== null && option._id !== '')
              .map((option: any) => (
                <SelectItem key={option._id} value={option._id.toString()}>
                  <div className="flex flex-col">
                    <span className="font-medium">{option.name}</span>
                    {option.description && <span className="text-xs text-muted-foreground">{option.description}</span>}
                  </div>
                </SelectItem>
              ))
          )}
        </div>
      </SelectContent>
    </Select>
  );
}
