"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export function ToggleGroup({ value, onValueChange, options, className }: { value: string; onValueChange: (v: string) => void; options: { label: string; value: string }[]; className?: string }) {
    return (
        <div className={cn("inline-flex rounded-lg border p-1 border-[var(--card-border)] bg-[var(--surface)]", className)} role="tablist">
            {options.map((opt) => {
                const active = opt.value === value;
                return (
                    <button
                        key={opt.value}
                        className={cn(
                            "px-3 py-1.5 text-sm rounded-md transition-colors",
                            active ? "bg-[var(--accent)] text-white" : "text-[var(--muted)] hover:bg-[var(--accent-100)]"
                        )}
                        onClick={() => onValueChange(opt.value)}
                        type="button"
                        role="tab"
                        aria-selected={active}
                    >
                        {opt.label}
                    </button>
                );
            })}
        </div>
    );
}


