'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number | null;
  max?: number;
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value = 0, max = 100, ...props }, ref) => {
    const pct = Math.min(Math.max((value || 0) / max * 100, 0), 100);
    return (
      <div
        ref={ref}
        className={cn('relative h-4 w-full overflow-hidden rounded-full bg-secondary', className)}
        {...props}
      >
        <div
          className="h-full rounded-full gradient-primary transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    );
  }
);
Progress.displayName = 'Progress';

export { Progress };
