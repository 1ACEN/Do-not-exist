"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export function UserNav() {
    // undefined = loading, null = not authenticated, object = authenticated
    const [user, setUser] = useState<any | undefined>(null);
    const [open, setOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        let mounted = true;
        const refresh = async () => {
            try {
                const res = await fetch("/api/me", { cache: "no-store" });
                const data = await res.json();
                if (mounted) setUser(data.user ?? null);
            } catch {
                if (mounted) setUser(null);
            }
        };
        refresh();
        const onStorage = (e: StorageEvent) => {
            if (e.key === "auth-refresh") refresh();
        };
        window.addEventListener("storage", onStorage);
        // expose manual trigger
        // @ts-ignore
        window.__authRefresh = refresh;
        const onClickAway = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener("click", onClickAway);
        return () => {
            mounted = false;
            window.removeEventListener("storage", onStorage);
            document.removeEventListener("click", onClickAway);
        };
    }, []);

    if (user === undefined) return null;

    if (user) {
        return (
            <div className="relative" ref={menuRef}>
                <button onClick={() => setOpen((v) => !v)} className="inline-flex items-center gap-2 rounded-full border border-[var(--card-border)] bg-[var(--surface)] px-3 py-1.5 text-sm hover:accent-outline">
                    <span className="font-medium">{user.name ?? "Account"}</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                </button>
                {open && (
                    <div className="absolute right-0 mt-2 w-48 rounded-md border border-[var(--card-border)] bg-[var(--surface)] shadow">
                        <Link href="/profile" className="block px-3 py-2 text-sm hover:bg-[var(--accent-100)]">Profile</Link>
                        {/* Show Analytics link for authorized roles */}
                        {user && (user.role === "doctor" || user.role === "analyst" || user.role === "admin") && (
                            <Link href="/admin" className="block px-3 py-2 text-sm hover:bg-[var(--accent-100)]">Analytics</Link>
                        )}
                        {/* Allow regular clients to assign a doctor */}
                        {user && (user.role === "client" || !user.role) && (
                            <Link href="/doctors" className="block px-3 py-2 text-sm hover:bg-[var(--accent-100)]">Assign Doctor</Link>
                        )}
                        <button onClick={async () => { await fetch("/api/me", { method: "POST" }); try { // @ts-ignore
                            window.__authRefresh?.(); // refresh the other nav too if present
                            // @ts-ignore
                            window.__authRefreshSiteNav?.();
                            localStorage.setItem("auth-refresh", String(Date.now())); } catch {} window.location.href = "/"; }} className="block w-full text-left px-3 py-2 text-sm hover:bg-[var(--accent-100)]">Log out</button>
                    </div>
                )}
            </div>
        );
    }

    return (
        <Link href="/login" className="inline-flex items-center gap-2 rounded-full border border-[var(--card-border)] bg-[var(--surface)] px-3 py-1.5 text-sm hover:accent-outline">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            Login
        </Link>
    );
}


