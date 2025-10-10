"use client";

import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cn } from "@/lib/utils";

export const Tabs = TabsPrimitive.Root;
export const TabsList = (
    props: React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
) => (
    <TabsPrimitive.List
        className={cn(
            "inline-flex h-10 items-center justify-center rounded-md p-1",
            "bg-[var(--surface)] text-[var(--muted)] border border-[var(--card-border)]"
        )}
        {...props}
    />
);

export const TabsTrigger = (
    props: React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
) => (
    <TabsPrimitive.Trigger
        className={cn(
            "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium transition-all",
            "data-[state=active]:bg-[var(--surface)] data-[state=active]:text-[var(--foreground)] data-[state=active]:shadow"
        )}
        {...props}
    />
);

export const TabsContent = (
    props: React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
) => (
    <TabsPrimitive.Content className="mt-2 focus-visible:outline-none" {...props} />
);


