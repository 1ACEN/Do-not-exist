"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

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
        // expose manual triggers so the login flow can refresh both navs.
        // Some code calls window.__authRefresh (UserNav) so also set it here.
        // @ts-ignore optional manual trigger
        window.__authRefreshSiteNav = refresh;
        // @ts-ignore
        window.__authRefresh = refresh;
        return () => {
            mounted = false;
            window.removeEventListener("storage", onStorage);
        };
    }, []);

    // If no user, render nothing for role-specific tabs. We avoid layout shift by
    // still returning an empty nav element so header spacing remains stable.
    if (!user) return <nav className="hidden md:flex items-center gap-4" />;

    // Role-based navigation
    const pathname = usePathname() ?? "/";

    if (user.role === "doctor") {
        const items = [
            { href: "/dashboard/doctor", label: "Dashboard" },
            { href: "/analyst", label: "Analyst" },
            { href: "/admin", label: "Analytics" },
            { href: "/doctors", label: "Doctors" },
        ];
        return (
            <nav className="hidden md:flex items-center gap-4">
                {items.map((it) => {
                    const active = pathname.startsWith(it.href);
                    return (
                        <Link
                            key={it.href}
                            href={it.href}
                            aria-current={active ? "page" : undefined}
                            className={cn(
                                "px-3 py-2 rounded-md transition-all duration-150 text-[var(--muted)]",
                                active
                                    ? "text-[var(--foreground)] font-semibold text-lg border-b-2 border-[var(--accent)]"
                                    : "hover:text-[var(--accent)] hover:font-medium"
                            )}
                        >
                            {it.label}
                        </Link>
                    );
                })}
            </nav>
        );
    }

    // Client/User navigation
    const items = [
        { href: "/dashboard/user", label: "Dashboard" },
        { href: "/diagnose-disease", label: "Diagnosis" },
        { href: "/vitals", label: "Vitals" },
        { href: "/doctors", label: "Doctors" },
    ];

    return (
        <nav className="hidden md:flex items-center gap-4">
            {items.map((it) => {
                const active = pathname.startsWith(it.href);
                return (
                    <Link
                        key={it.href}
                        href={it.href}
                        aria-current={active ? "page" : undefined}
                        className={cn(
                            "px-3 py-2 rounded-md transition-all duration-150 text-[var(--muted)]",
                            active
                                ? "text-[var(--foreground)] font-semibold text-lg border-b-2 border-[var(--accent)]"
                                : "hover:text-[var(--accent)] hover:font-medium"
                        )}
                    >
                        {it.label}
                    </Link>
                );
            })}
        </nav>
    );
}


