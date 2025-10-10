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
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Login failed");
      try {
        // @ts-ignore
        window.__authRefresh?.();
        localStorage.setItem("auth-refresh", String(Date.now()));
      } catch {}
      // Redirect users to their dashboard pages.
      if (role === "doctor") {
        router.replace("/dashboard/doctor");
      } else {
        try {
          // check if user has vitals for today
          const r = await fetch("/api/vitals");
          if (r.ok) {
            const data = await r.json();
            const items = data.items || [];
            const today = new Date().toISOString().slice(0, 10);
            const hasToday = items.some((it: any) => {
              try {
                const d = new Date(it.date);
                return d.toISOString().slice(0, 10) === today;
              } catch {
                return false;
              }
            });
            if (hasToday) router.replace("/dashboard/user");
            else router.replace("/daily-vitals");
          } else {
            router.replace("/dashboard/user");
          }
        } catch (e) {
          router.replace("/dashboard/user");
        }
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-4 inline-flex rounded-lg border border-slate-300 bg-white p-1">
        <button
          className={`px-4 py-1.5 text-sm rounded-md ${
            role === "client"
              ? "bg-sky-600 text-white"
              : "text-slate-700 hover:bg-slate-100"
          }`}
          onClick={() => setRole("client")}
          type="button"
        >
          Client
        </button>
        <button
          className={`px-4 py-1.5 text-sm rounded-md ${
            role === "doctor"
              ? "bg-sky-600 text-white"
              : "text-slate-700 hover:bg-slate-100"
          }`}
          onClick={() => setRole("doctor")}
          type="button"
        >
          Doctor
        </button>
      </div>

      <Card className="overflow-hidden border-slate-300">
        <div className="grid md:grid-cols-2 min-h-[460px]">
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
                <LoginForm
                  roleLabel="Client"
                  role={role}
                  onSubmit={onSubmit}
                  email={email}
                  setEmail={setEmail}
                  password={password}
                  setPassword={setPassword}
                  loading={loading}
                />
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
                <LoginForm
                  roleLabel="Doctor"
                  role={role}
                  onSubmit={onSubmit}
                  email={email}
                  setEmail={setEmail}
                  password={password}
                  setPassword={setPassword}
                  loading={loading}
                />
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
    <div className="text-sm text-slate-600">
      New here?{" "}
      <a
        className="text-sky-700 hover:underline"
        href={`/register?role=${role}`}
      >
        Create an account
      </a>
    </div>
  );
}

function InfoPanel({ type }: { type: "client" | "doctor" }) {
  return (
    <div className="relative h-full overflow-hidden p-10">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-red-50 via-white to-slate-100" />
      <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-red-100/70 blur-2xl" />
      <div className="pointer-events-none absolute -left-16 bottom-10 h-48 w-48 rounded-full bg-sky-100/60 blur-2xl" />
      <div className="relative z-10 flex h-full flex-col justify-center">
        <h2 className="text-3xl font-extrabold bg-gradient-to-r from-[var(--accent)] to-slate-900 bg-clip-text text-transparent">
          {type === "client" ? "Welcome back, Client" : "Welcome back, Doctor"}
        </h2>
        <p className="mt-3 text-slate-700">
          {type === "client"
            ? "Continue your journey to healthier habits with AI-powered insights."
            : "Review patient signals and continue care with clarity."}
        </p>
        <div className="mt-6 grid grid-cols-1 gap-3 text-sm text-slate-700">
          {type === "client" ? (
            <>
              <BadgeLine
                icon={<Activity className="h-4 w-4 text-sky-600" />}
                text="Track streaks and goals"
              />
              <BadgeLine
                icon={<HeartPulse className="h-4 w-4 text-[var(--accent)]" />}
                text="Get risk alerts early"
              />
              <BadgeLine
                icon={<Stethoscope className="h-4 w-4 text-slate-900" />}
                text="Share with your doctor"
              />
            </>
          ) : (
            <>
              <BadgeLine
                icon={<Stethoscope className="h-4 w-4 text-slate-900" />}
                text="Patient overview"
              />
              <BadgeLine
                icon={<Activity className="h-4 w-4 text-sky-600" />}
                text="Deviation alerts"
              />
              <BadgeLine
                icon={<HeartPulse className="h-4 w-4 text-[var(--accent)]" />}
                text="AI confidence scores"
              />
            </>
          )}
        </div>
      </div>
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

function LoginForm({
  roleLabel,
  role,
  onSubmit,
  email,
  setEmail,
  password,
  setPassword,
  loading,
}: {
  roleLabel: "Client" | "Doctor";
  role: "client" | "doctor";
  onSubmit: (e: React.FormEvent) => void;
  email: string;
  setEmail: (v: string) => void;
  password: string;
  setPassword: (v: string) => void;
  loading: boolean;
}) {
  const googleHref = `/api/auth/google?role=${encodeURIComponent(role)}`;

  return (
    <>
      <CardHeader className="border-b border-slate-100">
        <CardTitle className="flex items-center justify-between">
          <span>Login</span>
          <span className="rounded-md bg-sky-600 px-2 py-1 text-xs font-semibold text-white tracking-wide">
            {roleLabel}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <form className="grid gap-4" onSubmit={onSubmit}>
          <div className="grid gap-2">
            <Label htmlFor={`email-${roleLabel}`}>Email</Label>
            <Input
              id={`email-${roleLabel}`}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
              suppressHydrationWarning
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor={`password-${roleLabel}`}>Password</Label>
            <Input
              id={`password-${roleLabel}`}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <Button type="submit" disabled={loading}>
              {loading ? "Signing in..." : "Sign in"}
            </Button>
            <a href={googleHref} className="block">
              <Button variant="outline" type="button">
                Sign in with Google
              </Button>
            </a>
          </div>
          <p className="text-xs text-slate-500">
            You are signing in as{" "}
            <span className="font-medium">{roleLabel}</span>.
          </p>
          <RegisterHint role={roleLabel === "Client" ? "client" : "doctor"} />
        </form>
      </CardContent>
    </>
  );
}