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

    useEffect(() => {
        const r = params.get("role");
        if (r === "client" || r === "doctor") setRole(r);
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
            <div className="mb-4 inline-flex rounded-lg border border-slate-300 bg-white p-1">
                <button
                    className={`px-4 py-1.5 text-sm rounded-md ${role === "client" ? "bg-sky-600 text-white" : "text-slate-700 hover:bg-slate-100"}`}
                    onClick={() => setRole("client")}
                    type="button"
                >
                    Client
                </button>
                <button
                    className={`px-4 py-1.5 text-sm rounded-md ${role === "doctor" ? "bg-sky-600 text-white" : "text-slate-700 hover:bg-slate-100"}`}
                    onClick={() => setRole("doctor")}
                    type="button"
                >
                    Doctor
                </button>
            </div>

            <Card className="overflow-hidden border-slate-300">
                <div className="grid md:grid-cols-2 min-h-[520px]">
                    <AnimatePresence mode="wait" initial={false}>
                        {role === "client" ? (
                            <motion.div
                                key="client-form-left"
                                initial={{ x: -16, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                exit={{ x: -16, opacity: 0 }}
                                transition={{ duration: 0.35 }}
                                className="order-1"
                            >
                                <FormPanel roleLabel="Client" />
                            </motion.div>
                        ) : (
                            <motion.div
                                key="doctor-info-left"
                                initial={{ x: -16, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                exit={{ x: -16, opacity: 0 }}
                                transition={{ duration: 0.35 }}
                                className="order-1 hidden md:block"
                            >
                                <InfoPanel type="doctor" />
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <AnimatePresence mode="wait" initial={false}>
                        {role === "client" ? (
                            <motion.div
                                key="client-info-right"
                                initial={{ x: 16, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                exit={{ x: 16, opacity: 0 }}
                                transition={{ duration: 0.35 }}
                                className="order-2 hidden md:block"
                            >
                                <InfoPanel type="client" />
                            </motion.div>
                        ) : (
                            <motion.div
                                key="doctor-form-right"
                                initial={{ x: 16, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                exit={{ x: 16, opacity: 0 }}
                                transition={{ duration: 0.35 }}
                                className="order-2"
                            >
                                <FormPanel roleLabel="Doctor" />
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
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-red-50 via-white to-slate-100" />
            <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-red-100/70 blur-2xl" />
            <div className="pointer-events-none absolute -left-16 bottom-10 h-56 w-56 rounded-full bg-sky-100/60 blur-2xl" />

            <div className="relative z-10 flex h-full flex-col justify-center">
                <h2 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-[var(--accent)] to-slate-900 bg-clip-text text-transparent">
                    {type === "client" ? "For Clients" : "For Doctors"}
                </h2>
                <p className="mt-3 text-slate-700 text-base md:text-lg max-w-prose">
                    {type === "client"
                        ? "Log daily health, visualize trends, and get early warnings powered by AI."
                        : "Monitor patients in real time, compare parameters, and export evidence-backed reports."}
                </p>

                <div className="mt-6 grid grid-cols-1 gap-3 text-sm text-slate-700">
                    {type === "client" ? (
                        <>
                            <BadgeLine icon={<Activity className="h-4 w-4 text-sky-600" />} text="Daily vitals, mood, and lifestyle tracking" />
                            <BadgeLine icon={<HeartPulse className="h-4 w-4 text-[var(--accent)]" />} text="AI early warnings for silent risks" />
                            <BadgeLine icon={<Stethoscope className="h-4 w-4 text-slate-900" />} text="Share insights with your doctor securely" />
                        </>
                    ) : (
                        <>
                            <BadgeLine icon={<Stethoscope className="h-4 w-4 text-slate-900" />} text="Patient overview and longitudinal trends" />
                            <BadgeLine icon={<Activity className="h-4 w-4 text-sky-600" />} text="Deviation alerts and risk stratification" />
                            <BadgeLine icon={<HeartPulse className="h-4 w-4 text-[var(--accent)]" />} text="Exportable, confidence-scored findings" />
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

function FormPanel({ roleLabel }: { roleLabel: "Client" | "Doctor" }) {
    const router = useRouter();
    const [name, setName] = useState("");
    const [age, setAge] = useState<number | "">("");
    const [height, setHeight] = useState<number | "">("");
    const [weight, setWeight] = useState<number | "">("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [doctorId, setDoctorId] = useState("");
    const [loading, setLoading] = useState(false);

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        try {
            const payload: any = {
                role: roleLabel === "Client" ? "client" : "doctor",
                name,
                age: age === "" ? undefined : age,
                email,
            };
            if (roleLabel === "Client") {
                payload.height = height === "" ? undefined : height;
                payload.weight = weight === "" ? undefined : weight;
                payload.password = password;
            } else {
                payload.doctorId = (document.getElementById(`doctorId-${roleLabel}`) as HTMLInputElement | null)?.value || "";
            }
            const res = await fetch("/api/register", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
            if (!res.ok) throw new Error("Register failed");
            if (roleLabel === "Client") {
                router.replace("/");
            } else {
                router.replace("/analyst");
            }
        } finally {
            setLoading(false);
        }
    }

    const isDoctor = roleLabel === "Doctor";

    return (
        <div>
            <CardHeader className="border-b border-slate-100">
                <CardTitle className="flex items-center justify-between">
                    <span>Create account</span>
                    <span className="rounded-md bg-sky-600 px-2 py-1 text-xs font-semibold text-white tracking-wide">{roleLabel}</span>
                </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
                <form className="grid gap-4" onSubmit={onSubmit}>
                    <div className="grid gap-2 sm:grid-cols-2">
                        <div className="grid gap-2">
                            <Label htmlFor={`name-${roleLabel}`}>Full name</Label>
                            <Input id={`name-${roleLabel}`} value={name} onChange={(e) => setName(e.target.value)} required />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor={`age-${roleLabel}`}>Age</Label>
                            <Input id={`age-${roleLabel}`} type="number" min={0} max={120} value={age as number | undefined} onChange={(e) => setAge(e.target.value === "" ? "" : Number(e.target.value))} required />
                        </div>
                    </div>
                    {!isDoctor && (
                        <div className="grid gap-2 sm:grid-cols-2">
                            <div className="grid gap-2">
                                <Label htmlFor={`height-${roleLabel}`}>Height (cm)</Label>
                                <Input id={`height-${roleLabel}`} type="number" min={30} max={250} value={height as number | undefined} onChange={(e) => setHeight(e.target.value === "" ? "" : Number(e.target.value))} required />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor={`weight-${roleLabel}`}>Weight (kg)</Label>
                                <Input id={`weight-${roleLabel}`} type="number" min={2} max={400} value={weight as number | undefined} onChange={(e) => setWeight(e.target.value === "" ? "" : Number(e.target.value))} required />
                            </div>
                        </div>
                    )}
                    <div className="grid gap-2">
                        <Label htmlFor={`email-${roleLabel}`}>Email</Label>
                        <Input id={`email-${roleLabel}`} type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    </div>
                    {isDoctor ? (
                        <div className="grid gap-2">
                            <Label htmlFor={`doctorId-${roleLabel}`}>Doctor ID</Label>
                            <Input id={`doctorId-${roleLabel}`} value={doctorId} onChange={(e) => setDoctorId(e.target.value)} required />
                        </div>
                    ) : (
                        <div className="grid gap-2">
                            <Label htmlFor={`password-${roleLabel}`}>Password</Label>
                            <Input id={`password-${roleLabel}`} type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                        </div>
                    )}
                    <Button type="submit" disabled={loading}>{loading ? "Creating..." : "Create account"}</Button>
                    <p className="text-xs text-slate-500">You are registering as <span className="font-medium">{roleLabel}</span>.</p>
                </form>
            </CardContent>
        </div>
    );
}

function BadgeLine({ icon, text }: { icon: ReactNode; text: string }) {
    return (
        <div className="flex items-center gap-2 rounded-md border border-slate-200 bg-white/70 px-3 py-2">
            <span className="grid place-items-center rounded-sm bg-white p-1 shadow-sm">
                {icon}
            </span>
            <span>{text}</span>
        </div>
    );
}


