"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export function SiteNav() {
    const [hasUser, setHasUser] = useState<boolean>(false);

    useEffect(() => {
        let mounted = true;
        const refresh = async () => {
            try {
                const res = await fetch("/api/me", { cache: "no-store" });
                const data = await res.json();
                if (mounted) setHasUser(!!data.user);
            } catch {
                if (mounted) setHasUser(false);
            }
        };
        refresh();
        const onStorage = (e: StorageEvent) => {
            if (e.key === "auth-refresh") refresh();
        };
        window.addEventListener("storage", onStorage);
        // @ts-ignore optional manual trigger
        window.__authRefreshSiteNav = refresh;
        return () => {
            mounted = false;
            window.removeEventListener("storage", onStorage);
        };
    }, []);

    if (!hasUser) return null;

    return (
        <nav className="hidden md:flex items-center gap-6 text-sm">
            <Link href="/client" className="hover:text-sky-700">Client</Link>
            <Link href="/detective" className="hover:text-sky-700">Detective</Link>
            <Link href="/analyst" className="hover:text-sky-700">Analyst</Link>
            <Link href="/surveys" className="hover:text-sky-700">Surveys</Link>
            <Link href="/admin" className="hover:text-sky-700">Analytics</Link>
        </nav>
    );
}


