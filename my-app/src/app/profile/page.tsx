"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function ProfilePage() {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            const res = await fetch("/api/me", { cache: "no-store" });
            const data = await res.json();
            setUser(data.user);
            setLoading(false);
        })();
    }, []);

    async function logout() {
        await fetch("/api/me", { method: "POST" });
        try {
            // @ts-ignore
            window.__authRefresh?.();
            localStorage.setItem("auth-refresh", String(Date.now()));
        } catch {}
        window.location.href = "/";
    }

    if (loading) return <div>Loading...</div>;
    if (!user) return <div>Not logged in.</div>;

    return (
        <div className="max-w-2xl mx-auto">
            <Card>
                <CardHeader>
                    <CardTitle>Your Profile</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-slate-700">
                    <div><span className="font-medium">Name:</span> {user.name}</div>
                    <div><span className="font-medium">Email:</span> {user.email}</div>
                    <div><span className="font-medium">Role:</span> {user.role}</div>
                    {user.role === "client" && (
                        <div className="grid grid-cols-3 gap-4">
                            <div><span className="font-medium">Age:</span> {user.age}</div>
                            <div><span className="font-medium">Height:</span> {user.height} cm</div>
                            <div><span className="font-medium">Weight:</span> {user.weight} kg</div>
                        </div>
                    )}
                    {user.role === "doctor" && (
                        <div><span className="font-medium">Doctor ID:</span> {user.doctorId}</div>
                    )}
                    <div className="pt-4">
                        <Button onClick={logout}>Logout</Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}


