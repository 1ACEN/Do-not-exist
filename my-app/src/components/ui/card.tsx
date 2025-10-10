import * as React from "react";
import { cn } from "@/lib/utils";

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={cn(
                "rounded-lg border bg-[var(--background)] shadow-sm transition-all duration-200 card-hover",
                "border-[var(--card-border)]",
                className
            )}
            {...props}
        />
    );
}

export function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div className={cn("p-5 border-b bg-[var(--surface)]", "border-[var(--card-border)]", className)} {...props} />
    );
}

export function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
    return <h3 className={cn("text-base font-semibold text-[var(--foreground)] professional-heading", className)} {...props} />;
}

export function CardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return <div className={cn("p-5 text-[var(--foreground-muted)] professional-text", className)} {...props} />;
}

export function CardFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div className={cn("p-5 pt-0 border-t bg-[var(--surface)]", "border-[var(--card-border)]", className)} {...props} />
    );
}


