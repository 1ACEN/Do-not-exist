"use client";

import { useEffect, useState } from "react";

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/me", { cache: "no-store" });
        const data = await res.json();
        if (mounted) {
          setUser(data.user);
          // Add a small delay to prevent flickering
          setTimeout(() => {
            if (mounted) setLoading(false);
          }, 100);
        }
      } catch {
        if (mounted) {
          setUser(null);
          setTimeout(() => {
            if (mounted) setLoading(false);
          }, 100);
        }
      }
    };

    fetchUser();

    const onStorage = (e: StorageEvent) => {
      if (e.key === "auth-refresh") {
        fetchUser();
      }
    };

    window.addEventListener("storage", onStorage);
    
    // Expose manual refresh function
    // @ts-ignore
    window.__authRefresh = fetchUser;

    return () => {
      mounted = false;
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  return { user, loading };
}
