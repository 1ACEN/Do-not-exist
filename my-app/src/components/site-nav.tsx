"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/useAuth";

export function SiteNav() {
    const { user, loading } = useAuth();
    const pathname = usePathname() ?? "/";

    // During auth loading, render a lightweight placeholder nav to avoid layout shift
    if (loading || !user) {
        return (
            <nav className="hidden md:flex items-center gap-4 opacity-80 select-none">
                <span className="h-6 w-20 rounded bg-slate-200/60" />
                <span className="h-6 w-16 rounded bg-slate-200/60" />
                <span className="h-6 w-12 rounded bg-slate-200/60" />
            </nav>
        );
    }

    if (user.role === "doctor") {
        const items = [
            { href: "/dashboard/doctor", label: "Dashboard" },
            { href: "/analyst", label: "Analyst" },
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
                                "px-4 py-2 rounded-lg transition-all duration-200 text-[var(--foreground-muted)] font-medium",
                                active
                                    ? "text-[var(--accent)] font-semibold bg-[var(--accent-bg)] border-b-2 border-[var(--accent)]"
                                    : "hover:text-[var(--accent)] hover:bg-[var(--accent-bg)] hover:font-semibold"
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
        { href:'/analytics', label:"Analytics"}
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
                            "px-4 py-2 rounded-lg transition-all duration-200 text-[var(--foreground-muted)] font-medium",
                            active
                                ? "text-[var(--accent)] font-semibold bg-[var(--accent-bg)] border-b-2 border-[var(--accent)]"
                                : "hover:text-[var(--accent)] hover:bg-[var(--accent-bg)] hover:font-semibold"
                        )}
                    >
                        {it.label}
                    </Link>
                );
            })}
        </nav>
    );
}


