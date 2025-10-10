"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export type Toast = { id: number; title?: string; description?: string; variant?: "default" | "destructive" };

export function useToast() {
    const [toasts, setToasts] = useState<Toast[]>([]);
    function push(t: Omit<Toast, "id">) {
        const id = Date.now();
        setToasts((prev) => [...prev, { id, ...t }]);
        return id;
    }
    function dismiss(id: number) {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }
    return { toasts, push, dismiss };
}

export function ToastViewport({ toasts, onDismiss }: { toasts: Toast[]; onDismiss: (id: number) => void }) {
    useEffect(() => {
        const timers = toasts.map((t) => setTimeout(() => onDismiss(t.id), 4000));
        return () => timers.forEach(clearTimeout);
    }, [toasts, onDismiss]);
    return (
        <div className="fixed right-4 top-20 z-50 flex w-80 flex-col gap-2">
            {toasts.map((t) => (
                <div key={t.id} className={cn("rounded-md border p-3 shadow bg-[var(--surface)] text-[var(--foreground)]", t.variant === "destructive" ? "border-rose-200" : "border-[var(--card-border)]")}>
                    {t.title && <div className="text-sm font-medium">{t.title}</div>}
                    {t.description && <div className="text-sm text-[var(--muted)]">{t.description}</div>}
                </div>
            ))}
        </div>
    );
}


