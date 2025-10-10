"use client";

import { PropsWithChildren, useMemo } from "react";
import { ToastViewport, useToast } from "@/components/ui/toast";

export default function Providers({ children }: PropsWithChildren) {
    const toast = useToast();
    // expose toast globally via window for quick demo
    useMemo(() => {
        // @ts-ignore
        if (typeof window !== "undefined") window.__toast = toast;
    }, [toast]);
    return (
        <>
            {children}
            <ToastViewport toasts={toast.toasts} onDismiss={toast.dismiss} />
        </>
    );
}


