"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/lib/useAuth";

export function UserNav() {
    const { user, loading } = useAuth();
    const [open, setOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const onClickAway = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener("click", onClickAway);
        return () => {
            document.removeEventListener("click", onClickAway);
        };
    }, []);

    // Show login button immediately during loading to prevent layout shift
    if (loading) {
        return (
            <Link href="/login" className="inline-flex items-center gap-2 rounded-full border border-[var(--card-border)] bg-[var(--surface)] px-4 py-2 text-sm hover:accent-outline transition-all duration-200 hover:bg-[var(--accent-bg)]">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                <span className="text-[var(--foreground)]">Login</span>
            </Link>
        );
    }

    if (user) {
        return (
            <div className="relative" ref={menuRef}>
                <button onClick={() => setOpen((v) => !v)} className="inline-flex items-center gap-2 rounded-full border border-[var(--card-border)] bg-[var(--surface)] px-4 py-2 text-sm hover:accent-outline transition-all duration-200 hover:bg-[var(--accent-bg)]">
                    <span className="font-medium text-[var(--foreground)]">{user.name ?? "Account"}</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                </button>
                {open && (
                    <div className="absolute right-0 mt-2 w-48 rounded-lg border border-[var(--card-border)] bg-[var(--surface)] shadow-lg backdrop-blur-sm">
                        <Link href="/profile" className="block px-4 py-3 text-sm text-[var(--foreground-muted)] hover:bg-[var(--accent-bg)] hover:text-[var(--accent)] transition-colors duration-200">Profile</Link>
                        {/* Show Analytics link for authorized roles */}
                        {user && (user.role === "doctor" || user.role === "analyst" || user.role === "admin") && (
                            <Link href="/admin" className="block px-4 py-3 text-sm text-[var(--foreground-muted)] hover:bg-[var(--accent-bg)] hover:text-[var(--accent)] transition-colors duration-200">Analytics</Link>
                        )}
                        {/* Allow regular clients to assign a doctor */}
                        {user && (user.role === "client" || !user.role) && (
                            <Link href="/doctors" className="block px-4 py-3 text-sm text-[var(--foreground-muted)] hover:bg-[var(--accent-bg)] hover:text-[var(--accent)] transition-colors duration-200">Assign Doctor</Link>
                        )}
                        <button onClick={async () => { await fetch("/api/me", { method: "POST" }); try { // @ts-ignore
                            window.__authRefresh?.(); localStorage.setItem("auth-refresh", String(Date.now())); } catch {} window.location.href = "/"; }} className="block w-full text-left px-4 py-3 text-sm text-[var(--foreground-muted)] hover:bg-[var(--accent-bg)] hover:text-[var(--accent)] transition-colors duration-200">Log out</button>
                    </div>
                )}
            </div>
        );
    }

    return (
        <Link href="/login" className="inline-flex items-center gap-2 rounded-full border border-[var(--card-border)] bg-[var(--surface)] px-4 py-2 text-sm hover:accent-outline transition-all duration-200 hover:bg-[var(--accent-bg)]">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            <span className="text-[var(--foreground)]">Login</span>
        </Link>
    );
}


