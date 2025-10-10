"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/useAuth";

export function SiteNav() {
    const { user, loading } = useAuth();
    const pathname = usePathname() ?? "/";

    // Don't show navigation until we know the user state
    if (loading || !user) return null;

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


