'use client';

import * as React from 'react';

import { cn } from '@/lib/utils';

type CheckboxProps = Omit<React.ComponentProps<'input'>, 'type'> & {
  /** Tampilan setengah tercentang, dipakai saat sebagian baris terpilih */
  indeterminate?: boolean;
};

function Checkbox({ className, indeterminate = false, ...props }: CheckboxProps) {
  const ref = React.useRef<HTMLInputElement>(null);

  // indeterminate hanya bisa diset lewat DOM, tidak ada atributnya di HTML
  React.useEffect(() => {
    if (ref.current) {
      ref.current.indeterminate = indeterminate;
    }
  }, [indeterminate]);

  return (
    <input
      ref={ref}
      type="checkbox"
      data-slot="checkbox"
      className={cn('size-4 shrink-0 cursor-pointer rounded border-gray-300 accent-primary-600 disabled:cursor-not-allowed disabled:opacity-40', className)}
      {...props}
    />
  );
}

export { Checkbox };
