"use client";

import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";
import { cn } from "@/lib/utils";

export interface ProgressProps
    extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> {
    value?: number;
}

export const Progress = React.forwardRef<
    React.ElementRef<typeof ProgressPrimitive.Root>,
    ProgressProps
>(({ className, value = 0, ...props }, ref) => (
    <ProgressPrimitive.Root
        ref={ref}
        className={cn(
            "relative h-3 w-full overflow-hidden rounded-full bg-slate-200",
            className
        )}
        {...props}
    >
        <ProgressPrimitive.Indicator
            className="h-full w-full flex-1 bg-sky-500 transition-transform"
            style={{ transform: `translateX(-${100 - Math.min(100, Math.max(0, value))}%)` }}
        />
    </ProgressPrimitive.Root>
));
Progress.displayName = "Progress";


