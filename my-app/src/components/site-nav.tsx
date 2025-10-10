"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export function SiteNav() {
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        let mounted = true;
        const refresh = async () => {
            try {
                const res = await fetch("/api/me", { cache: "no-store" });
                const data = await res.json();
                if (mounted) setUser(data.user);
            } catch {
                if (mounted) setUser(null);
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

    if (!user) return null;

    // Role-based navigation
    if (user.role === "doctor") {
        return (
            <nav className="hidden md:flex items-center gap-6 text-sm">
                <Link href="/dashboard/doctor" className="hover:text-sky-700">Dashboard</Link>
                <Link href="/analyst" className="hover:text-sky-700">Analyst</Link>
                <Link href="/admin" className="hover:text-sky-700">Analytics</Link>
            </nav>
        );
    }

    // Client/User navigation
    return (
        <nav className="hidden md:flex items-center gap-6 text-sm">
            <Link href="/dashboard/user" className="hover:text-sky-700">Dashboard</Link>
            <Link href="/diagnose-disease" className="hover:text-sky-700">Diagnosis</Link>
            <Link href="/vitals" className="hover:text-sky-700">Vitals</Link>
        </nav>
    );
}


