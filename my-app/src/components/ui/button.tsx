"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
    "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] disabled:pointer-events-none disabled:opacity-50 btn-animate",
    {
        variants: {
            variant: {
                default:
                    "bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)] shadow-sm hover:shadow-md",
                secondary:
                    "bg-[var(--surface)] text-[var(--foreground)] border border-[var(--card-border)] hover:bg-[var(--accent-bg)] hover:border-[var(--card-border-hover)]",
                outline:
                    "border border-[var(--accent)] bg-transparent text-[var(--accent)] hover:bg-[var(--accent)] hover:text-white",
                ghost: "hover:bg-[var(--accent-bg)] text-[var(--foreground)] hover:text-[var(--accent)]",
                destructive:
                    "bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)] shadow-sm",
                gradient:
                    "bg-gradient-to-r from-[var(--accent)] to-[var(--accent-light)] text-white hover:from-[var(--accent-hover)] hover:to-[var(--accent-dark)] shadow-sm",
            },
            size: {
                default: "h-9 px-4 py-2",
                sm: "h-8 rounded-md px-3 text-xs",
                lg: "h-11 rounded-md px-6 text-base",
                icon: "h-9 w-9",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    }
);

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
        VariantProps<typeof buttonVariants> {
    asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant, size, asChild = false, ...props }, ref) => {
        const Comp = asChild ? Slot : "button";
        return (
            <Comp
                className={cn(buttonVariants({ variant, size }), className)}
                ref={ref}
                {...props}
            />
        );
    }
);
Button.displayName = "Button";


