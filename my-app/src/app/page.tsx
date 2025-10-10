"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Brain, LineChart } from "lucide-react";
import { useState } from "react";

export default function Home() {
  return (
    <div className="space-y-16">
  <section className="relative w-full h-[calc(100vh-6rem)] overflow-hidden bg-gradient-to-br from-red-50 via-white to-[var(--background)] p-10 flex items-center">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="max-w-3xl mx-auto">
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900 leading-[1.12] md:leading-[1.2]">
            Healthcare Eclipse – Predicting Silent Diseases
          </h1>
              <p className="mt-6 text-lg text-[var(--muted)]">
            Detect the Undetected – AI that predicts silent diseases early, from everyday signals like sleep, heart rate, blood pressure, and mood.
          </p>
          <div className="mt-20 md:mt-28 max-w-3xl">
            <h3 className="text-2xl font-semibold text-[var(--foreground)]">Start your journey</h3>
            <p className="mt-2 text-[var(--muted)] max-w-2xl">Create an account to log daily health, track trends, and receive early warnings powered by AI. Share insights securely with your doctor.</p>
            <div className="mt-4 flex items-center gap-3">
              <Link href="/register">
                <Button className="rounded-lg shadow" style={{ backgroundColor: "var(--accent)", boxShadow: "0 6px 12px rgba(0,0,0,0.12)" }}>Get Started</Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" className="rounded-lg">Login</Button>
              </Link>
            </div>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="pointer-events-none absolute -right-24 -top-16 h-96 w-96 rounded-full bg-red-100 opacity-60"
        />
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        <Card className="transition-colors hover:bg-red-50/40 hover:border-[var(--accent)]/40">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Activity className="h-5 w-5 text-sky-600"/>The Client</CardTitle>
          </CardHeader>
          <CardContent className="text-slate-600">Health Logger App – track vitals, mood, lifestyle, and get instant insights that grow smarter every day.</CardContent>
        </Card>
        <Card className="transition-colors hover:bg-red-50/40 hover:border-[var(--accent)]/40">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Brain className="h-5 w-5 text-sky-600"/>The Detective</CardTitle>
          </CardHeader>
          <CardContent className="text-slate-600">AI Early Warning Core – surfaces anomalies and flags risks before symptoms show up.</CardContent>
        </Card>
        <Card className="transition-colors hover:bg-red-50/40 hover:border-[var(--accent)]/40">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><LineChart className="h-5 w-5 text-sky-600"/>The Analyst</CardTitle>
          </CardHeader>
          <CardContent className="text-slate-600">Doctor Dashboard – monitor patients, compare parameters, and export reports with confidence scores.</CardContent>
        </Card>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-10 md:p-12">
        <div className="max-w-4xl">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900">Why Healthcare Eclipse?</h2>
          <p className="mt-3 text-slate-600">A unified experience for users and doctors. Our platform blends daily logging, AI predictions, and clinician tools to help detect risks before they escalate.</p>
        </div>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          <div className="rounded-xl border border-slate-200 p-6 bg-slate-50">
            <div className="text-sm font-semibold text-slate-900">Early Detection</div>
            <p className="mt-2 text-sm text-slate-600">Surface silent disease risks from subtle changes in everyday signals.</p>
          </div>
          <div className="rounded-xl border border-slate-200 p-6 bg-slate-50">
            <div className="text-sm font-semibold text-slate-900">Clear Visuals</div>
            <p className="mt-2 text-sm text-slate-600">Charts and trends that make health patterns obvious at a glance.</p>
          </div>
          <div className="rounded-xl border border-slate-200 p-6 bg-slate-50">
            <div className="text-sm font-semibold text-slate-900">Doctor Collaboration</div>
            <p className="mt-2 text-sm text-slate-600">Securely share insights with clinicians and export report-ready views.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
