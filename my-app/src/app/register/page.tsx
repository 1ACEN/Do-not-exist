"use client";

import { useEffect, useState, ReactNode } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion, AnimatePresence } from "framer-motion";
import { HeartPulse, Activity, Stethoscope } from "lucide-react";

export default function RegisterPage() {
    const params = useSearchParams();
    const [role, setRole] = useState<"client" | "doctor">("client");
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    // Advanced doctor fields like Doctor ID can be added later if needed.
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    // Default to client, but allow doctor selection in the UI
    useEffect(() => {
        setRole("client");
    }, [params]);

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        try {
            await new Promise((r) => setTimeout(r, 800));
            router.push("/login?registered=1");
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
                <div className="grid md:grid-cols-2 min-h-[520px]">
                    <AnimatePresence mode="wait" initial={false}>
                        {role === "client" ? (
                            <motion.div key="client-form-left" initial={{ x: -16, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -16, opacity: 0 }} transition={{ duration: 0.35 }} className="order-1">
                                <FormPanel role={role} setRole={setRole} />
                            </motion.div>
                        ) : (
                            <motion.div key="doctor-form-left" initial={{ x: -16, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -16, opacity: 0 }} transition={{ duration: 0.35 }} className="order-1">
                                <FormPanel role={role} setRole={setRole} />
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <AnimatePresence mode="wait" initial={false}>
                        {role === "client" ? (
                            <motion.div key="client-info-right" initial={{ x: 16, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 16, opacity: 0 }} transition={{ duration: 0.35 }} className="order-2 hidden md:block">
                                <InfoPanel type="client" />
                            </motion.div>
                        ) : (
                            <motion.div key="doctor-info-right" initial={{ x: 16, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 16, opacity: 0 }} transition={{ duration: 0.35 }} className="order-2 hidden md:block">
                                <InfoPanel type="doctor" />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </Card>
        </div>
    );
}

function InfoPanel({ type }: { type: "client" | "doctor" }) {
    return (
        <div className="relative h-full overflow-hidden p-10">
            {/* background */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[var(--red-50)] via-[var(--background)] to-[var(--red-100)]" />
            <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-[var(--red-200)]/70 blur-2xl" />
            <div className="pointer-events-none absolute -left-16 bottom-10 h-56 w-56 rounded-full bg-[var(--red-100)]/60 blur-2xl" />

            <div className="relative z-10 flex h-full flex-col justify-center">
                <h2 className="text-3xl md:text-4xl font-extrabold gradient-text">
                    {type === "client" ? "For Clients" : "For Doctors"}
                </h2>
                <p className="mt-3 text-[var(--foreground-muted)] text-base md:text-lg max-w-prose">
                    {type === "client"
                        ? "Log daily health, visualize trends, and get early warnings powered by AI."
                        : "Monitor patients in real time, compare parameters, and export evidence-backed reports."}
                </p>

                <div className="mt-6 grid grid-cols-1 gap-3 text-sm text-[var(--foreground-muted)]">
                    {type === "client" ? (
                        <>
                            <BadgeLine icon={<Activity className="h-4 w-4 text-[var(--accent)]" />} text="Daily vitals, mood, and lifestyle tracking" />
                            <BadgeLine icon={<HeartPulse className="h-4 w-4 text-[var(--accent)]" />} text="AI early warnings for silent risks" />
                            <BadgeLine icon={<Stethoscope className="h-4 w-4 text-[var(--accent)]" />} text="Share insights with your doctor securely" />
                        </>
                    ) : (
                        <>
                            <BadgeLine icon={<Stethoscope className="h-4 w-4 text-[var(--accent)]" />} text="Patient overview and longitudinal trends" />
                            <BadgeLine icon={<Activity className="h-4 w-4 text-[var(--accent)]" />} text="Deviation alerts and risk stratification" />
                            <BadgeLine icon={<HeartPulse className="h-4 w-4 text-[var(--accent)]" />} text="Exportable, confidence-scored findings" />
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

function FormPanel({ role, setRole }: { role: "client" | "doctor"; setRole: (r: "client" | "doctor") => void }) {
    const router = useRouter();
    const [name, setName] = useState("");
    const [age, setAge] = useState<number | "">("");
    const [height, setHeight] = useState<number | "">("");
    const [weight, setWeight] = useState<number | "">("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [doctorId, setDoctorId] = useState("");
    const [specialization, setSpecialization] = useState("");
    const [loading, setLoading] = useState(false);

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        try {
            const payload: any = {
                role,
                name,
                age: age === "" ? undefined : age,
                email,
                height: height === "" ? undefined : height,
                weight: weight === "" ? undefined : weight,
                password,
            } as any;
            if (role === "doctor") {
                payload.specialization = specialization;
            }

            const res = await fetch("/api/register", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
            if (!res.ok) {
                const errorData = await res.json().catch(() => ({ error: "Registration failed" }));
                throw new Error(errorData.error || "Registration failed");
            }
            router.replace("/login?registered=1");
        } catch (error) {
            console.error("Registration error:", error);
            alert(error instanceof Error ? error.message : "Registration failed. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div>
                    <CardHeader className="border-b border-[var(--card-border)]">
                <CardTitle className="flex items-center justify-between">
                    <span className="text-xl font-semibold">Create account</span>
                </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
                <form className="grid gap-6" onSubmit={onSubmit}>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="grid gap-2">
                            <Label htmlFor={`name-${role}`} className="text-[var(--foreground)] font-medium">Full name</Label>
                            <Input id={`name-${role}`} value={name} onChange={(e) => setName(e.target.value)} required className="border-[var(--card-border)] focus:border-[var(--accent)]" />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor={`age-${role}`} className="text-[var(--foreground)] font-medium">Age</Label>
                            <Input id={`age-${role}`} type="number" min={0} max={120} value={age as number | undefined} onChange={(e) => setAge(e.target.value === "" ? "" : Number(e.target.value))} required className="border-[var(--card-border)] focus:border-[var(--accent)]" />
                        </div>
                    </div>
                    {role !== 'doctor' && (
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="grid gap-2">
                                <Label htmlFor={`height-${role}`} className="text-[var(--foreground)] font-medium">Height (cm)</Label>
                                <Input id={`height-${role}`} type="number" min={30} max={250} value={height as number | undefined} onChange={(e) => setHeight(e.target.value === "" ? "" : Number(e.target.value))} required className="border-[var(--card-border)] focus:border-[var(--accent)]" />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor={`weight-${role}`} className="text-[var(--foreground)] font-medium">Weight (kg)</Label>
                                <Input id={`weight-${role}`} type="number" min={2} max={400} value={weight as number | undefined} onChange={(e) => setWeight(e.target.value === "" ? "" : Number(e.target.value))} required className="border-[var(--card-border)] focus:border-[var(--accent)]" />
                            </div>
                        </div>
                    )}
                    {role === 'doctor' && (
                        <div className="grid gap-2">
                            <Label htmlFor="specialization" className="text-[var(--foreground)] font-medium">Specialization / Field</Label>
                            <Input id="specialization" value={specialization} onChange={(e) => setSpecialization(e.target.value)} placeholder="e.g. Cardiology, General Medicine" required className="border-[var(--card-border)] focus:border-[var(--accent)]" />
                        </div>
                    )}
                    <div className="grid gap-2">
                        <Label htmlFor={`email-${role}`} className="text-[var(--foreground)] font-medium">Email</Label>
                        <Input id={`email-${role}`} type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="border-[var(--card-border)] focus:border-[var(--accent)]" />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor={`password-${role}`} className="text-[var(--foreground)] font-medium">Password</Label>
                        <Input id={`password-${role}`} type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="border-[var(--card-border)] focus:border-[var(--accent)]" />
                    </div>
                    <Button type="submit" disabled={loading} className="w-full">{loading ? "Creating..." : "Create account"}</Button>
                    <p className="text-xs text-[var(--foreground-muted)]">You are registering as <span className="font-medium text-[var(--accent)]">{role === 'doctor' ? 'Doctor' : 'Client'}</span>.</p>
                </form>
            </CardContent>
        </div>
    );
}

function BadgeLine({ icon, text }: { icon: ReactNode; text: string }) {
    return (
        <div className="flex items-center gap-3 rounded-lg border border-[var(--card-border)] bg-[var(--surface)]/70 px-4 py-3 hover:bg-[var(--accent-bg)] transition-colors duration-200">
            <span className="grid place-items-center rounded-lg bg-[var(--accent-bg)] p-2 shadow-sm">
                {icon}
            </span>
            <span className="font-medium">{text}</span>
        </div>
    );
}


