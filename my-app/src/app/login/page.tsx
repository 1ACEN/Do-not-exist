"use client";

import { useState, ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Activity, HeartPulse, Stethoscope } from "lucide-react";

export default function LoginPage() {
    const [role, setRole] = useState<"client" | "doctor">("client");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        try {
            const payload: any = { role, email, password };
            const res = await fetch("/api/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
            
            if (!res.ok) {
                const errorData = await res.json().catch(() => ({ error: "Login failed" }));
                throw new Error(errorData.error || "Login failed");
            }
            
            try {
                // @ts-ignore
                window.__authRefresh?.();
                localStorage.setItem("auth-refresh", String(Date.now()));
            } catch {}
            
            // Redirect users to their dashboard pages.
            if (role === "doctor") {
                router.replace('/dashboard/doctor');
            } else {
                try {
                    // check if user has vitals for today
                    const r = await fetch('/api/vitals');
                    if (r.ok) {
                        const data = await r.json();
                        const items = data.items || [];
                        const today = new Date().toISOString().slice(0,10);
                        const hasToday = items.some((it: any) => {
                            try {
                                const d = new Date(it.date);
                                return d.toISOString().slice(0,10) === today;
                            } catch { return false; }
                        });
                        if (hasToday) router.replace('/dashboard/user');
                        else router.replace('/daily-vitals');
                    } else {
                        router.replace('/dashboard/user');
                    }
                } catch (e) {
                    router.replace('/dashboard/user');
                }
            }
        } catch (error) {
            console.error("Login error:", error);
            alert(error instanceof Error ? error.message : "Login failed. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="mx-auto max-w-5xl">
            <div className="mb-6 inline-flex rounded-lg border border-[var(--card-border)] bg-[var(--surface)] p-1">
                <button className={`px-4 py-2 text-sm rounded-md transition-all duration-200 ${role === "client" ? "bg-[var(--accent)] text-white shadow-md" : "text-[var(--foreground-muted)] hover:bg-[var(--accent-bg)] hover:text-[var(--accent)]"}`} onClick={() => setRole("client")} type="button">Client</button>
                <button className={`px-4 py-2 text-sm rounded-md transition-all duration-200 ${role === "doctor" ? "bg-[var(--accent)] text-white shadow-md" : "text-[var(--foreground-muted)] hover:bg-[var(--accent-bg)] hover:text-[var(--accent)]"}`} onClick={() => setRole("doctor")} type="button">Doctor</button>
            </div>

            <Card className="overflow-hidden border-[var(--card-border)] shadow-lg">
                <div className="grid md:grid-cols-2 min-h-[460px]">
                    <AnimatePresence mode="wait" initial={false}>
                        {role === "client" ? (
                            <motion.div key="client-form-left" initial={{ x: -16, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -16, opacity: 0 }} transition={{ duration: 0.35 }} className="order-1">
                                <LoginForm roleLabel="Client" onSubmit={onSubmit} email={email} setEmail={setEmail} password={password} setPassword={setPassword} loading={loading} />
                            </motion.div>
                        ) : (
                            <motion.div key="doctor-info-left" initial={{ x: -16, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -16, opacity: 0 }} transition={{ duration: 0.35 }} className="order-1 hidden md:block">
                                <InfoPanel type="doctor" />
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <AnimatePresence mode="wait" initial={false}>
                        {role === "client" ? (
                            <motion.div key="client-info-right" initial={{ x: 16, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 16, opacity: 0 }} transition={{ duration: 0.35 }} className="order-2 hidden md:block">
                                <InfoPanel type="client" />
                            </motion.div>
                        ) : (
                            <motion.div key="doctor-form-right" initial={{ x: 16, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 16, opacity: 0 }} transition={{ duration: 0.35 }} className="order-2">
                                <LoginForm roleLabel="Doctor" onSubmit={onSubmit} email={email} setEmail={setEmail} password={password} setPassword={setPassword} loading={loading} />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </Card>
        </div>
    );
}

function RegisterHint({ role }: { role: "client" | "doctor" }) {
    return (
        <div className="text-sm text-[var(--foreground-muted)]">
            New here? <a className="text-[var(--accent)] hover:underline font-medium" href={`/register?role=${role}`}>Create an account</a>
        </div>
    );
}

function InfoPanel({ type }: { type: "client" | "doctor" }) {
    return (
        <div className="relative h-full overflow-hidden p-10">
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[var(--red-50)] via-[var(--background)] to-[var(--red-100)]" />
            <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-[var(--red-200)]/70 blur-2xl" />
            <div className="pointer-events-none absolute -left-16 bottom-10 h-48 w-48 rounded-full bg-[var(--red-100)]/60 blur-2xl" />
            <div className="relative z-10 flex h-full flex-col justify-center">
                <h2 className="text-3xl font-extrabold gradient-text">{type === "client" ? "Welcome back, Client" : "Welcome back, Doctor"}</h2>
                <p className="mt-3 text-[var(--foreground-muted)]">{type === "client" ? "Continue your journey to healthier habits with AI-powered insights." : "Review patient signals and continue care with clarity."}</p>
                <div className="mt-6 grid grid-cols-1 gap-3 text-sm text-[var(--foreground-muted)]">
                    {type === "client" ? (
                        <>
                            <BadgeLine icon={<Activity className="h-4 w-4 text-[var(--accent)]" />} text="Track streaks and goals" />
                            <BadgeLine icon={<HeartPulse className="h-4 w-4 text-[var(--accent)]" />} text="Get risk alerts early" />
                            <BadgeLine icon={<Stethoscope className="h-4 w-4 text-[var(--accent)]" />} text="Share with your doctor" />
                        </>
                    ) : (
                        <>
                            <BadgeLine icon={<Stethoscope className="h-4 w-4 text-[var(--accent)]" />} text="Patient overview" />
                            <BadgeLine icon={<Activity className="h-4 w-4 text-[var(--accent)]" />} text="Deviation alerts" />
                            <BadgeLine icon={<HeartPulse className="h-4 w-4 text-[var(--accent)]" />} text="AI confidence scores" />
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

function BadgeLine({ icon, text }: { icon: ReactNode; text: string }) {
    return (
        <div className="flex items-center gap-3 rounded-lg border border-[var(--card-border)] bg-[var(--surface)]/70 px-4 py-3 hover:bg-[var(--accent-bg)] transition-colors duration-200">
            <span className="grid place-items-center rounded-lg bg-[var(--accent-bg)] p-2 shadow-sm">{icon}</span>
            <span className="font-medium">{text}</span>
        </div>
    );
}

function LoginForm({ roleLabel, onSubmit, email, setEmail, password, setPassword, loading }: { roleLabel: "Client" | "Doctor"; onSubmit: (e: React.FormEvent) => void; email: string; setEmail: (v: string) => void; password: string; setPassword: (v: string) => void; loading: boolean; }) {
    return (
        <div>
            <CardHeader className="border-b border-[var(--card-border)]">
                <CardTitle className="flex items-center justify-between">
                    <span className="text-xl font-semibold">Login</span>
                    <span className="rounded-lg bg-[var(--accent)] px-3 py-1 text-xs font-semibold text-white tracking-wide">{roleLabel}</span>
                </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
                <form className="grid gap-6" onSubmit={onSubmit}>
                    <div className="grid gap-2">
                        <Label htmlFor={`email-${roleLabel}`} className="text-[var(--foreground)] font-medium">Email</Label>
                        <Input id={`email-${roleLabel}`} type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="you@example.com" suppressHydrationWarning className="border-[var(--card-border)] focus:border-[var(--accent)]" />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor={`password-${roleLabel}`} className="text-[var(--foreground)] font-medium">Password</Label>
                        <Input id={`password-${roleLabel}`} type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="border-[var(--card-border)] focus:border-[var(--accent)]" />
                    </div>
                    <Button type="submit" disabled={loading} className="w-full">{loading ? "Signing in..." : "Sign in"}</Button>
                    <p className="text-xs text-[var(--foreground-muted)]">You are signing in as <span className="font-medium text-[var(--accent)]">{roleLabel}</span>.</p>
                    <RegisterHint role={roleLabel === "Client" ? "client" : "doctor"} />
                </form>
            </CardContent>
        </div>
    );
}


