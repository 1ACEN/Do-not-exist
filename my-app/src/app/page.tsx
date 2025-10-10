"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Brain, LineChart } from "lucide-react";
import { useState } from "react";

export default function Home() {
  return (
    <div className="space-y-20">
      <section className="relative w-full h-[calc(100vh-6rem)] overflow-hidden bg-[var(--background)] p-12 flex items-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="max-w-5xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-[1.1] mb-8 professional-heading">
            <span className="gradient-text">Healthcare Eclipse</span>
            <br />
            <span className="text-[var(--foreground)]">Predicting Silent Diseases</span>
          </h1>
          <p className="mt-8 text-lg md:text-xl text-[var(--foreground-muted)] leading-relaxed max-w-4xl mx-auto professional-text">
            Detect the Undetected – AI that predicts silent diseases early, from everyday signals like sleep, heart rate, blood pressure, and mood.
          </p>
          <div className="mt-16 max-w-2xl mx-auto">
            <h3 className="text-2xl font-semibold text-[var(--foreground)] mb-4 professional-heading">Start your journey</h3>
            <p className="mt-4 text-base text-[var(--foreground-muted)] leading-relaxed professional-text">Create an account to log daily health, track trends, and receive early warnings powered by AI. Share insights securely with your doctor.</p>
            <div className="mt-8 flex items-center justify-center gap-4">
              <Link href="/register">
                <Button variant="default" size="lg" className="px-6 py-3">Get Started</Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" size="lg" className="px-6 py-3">Login</Button>
              </Link>
            </div>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.3 }}
          className="pointer-events-none absolute -right-32 -top-20 h-96 w-96 rounded-full bg-[var(--red-100)] opacity-20 blur-3xl"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, delay: 0.6 }}
          className="pointer-events-none absolute -left-24 -bottom-16 h-80 w-80 rounded-full bg-[var(--red-50)] opacity-30 blur-3xl"
        />
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        <Card className="group">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="p-2 rounded-md bg-[var(--accent-bg)] group-hover:bg-[var(--accent-bg-hover)] transition-all duration-200">
                <Activity className="h-5 w-5 text-[var(--accent)]" />
              </div>
              The Client
            </CardTitle>
          </CardHeader>
          <CardContent>Health Logger App – track vitals, mood, lifestyle, and get instant insights that grow smarter every day.</CardContent>
        </Card>
        <Card className="group">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="p-2 rounded-md bg-[var(--accent-bg)] group-hover:bg-[var(--accent-bg-hover)] transition-all duration-200">
                <Brain className="h-5 w-5 text-[var(--accent)]" />
              </div>
              The Detective
            </CardTitle>
          </CardHeader>
          <CardContent>AI Early Warning Core – surfaces anomalies and flags risks before symptoms show up.</CardContent>
        </Card>
        <Card className="group">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="p-2 rounded-md bg-[var(--accent-bg)] group-hover:bg-[var(--accent-bg-hover)] transition-all duration-200">
                <LineChart className="h-5 w-5 text-[var(--accent)]" />
              </div>
              The Analyst
            </CardTitle>
          </CardHeader>
          <CardContent>Doctor Dashboard – monitor patients, compare parameters, and export reports with confidence scores.</CardContent>
        </Card>
      </section>

      <section className="rounded-lg border border-[var(--card-border)] bg-[var(--surface)] p-12 md:p-16 shadow-sm">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold gradient-text mb-6 professional-heading">Why Healthcare Eclipse?</h2>
          <p className="mt-6 text-lg text-[var(--foreground-muted)] leading-relaxed max-w-3xl mx-auto professional-text">A unified experience for users and doctors. Our platform blends daily logging, AI predictions, and clinician tools to help detect risks before they escalate.</p>
        </div>
        <div className="mt-16 grid gap-6 md:grid-cols-3">
          <div className="rounded-lg border border-[var(--card-border)] p-6 bg-[var(--background)] hover:shadow-md transition-all duration-200 group">
            <div className="w-10 h-10 rounded-lg bg-[var(--accent-bg)] flex items-center justify-center mb-4 group-hover:bg-[var(--accent-bg-hover)] transition-colors duration-200">
              <Activity className="h-5 w-5 text-[var(--accent)]" />
            </div>
            <div className="text-lg font-semibold text-[var(--foreground)] mb-3 professional-heading">Early Detection</div>
            <p className="text-[var(--foreground-muted)] leading-relaxed professional-text">Surface silent disease risks from subtle changes in everyday signals.</p>
          </div>
          <div className="rounded-lg border border-[var(--card-border)] p-6 bg-[var(--background)] hover:shadow-md transition-all duration-200 group">
            <div className="w-10 h-10 rounded-lg bg-[var(--accent-bg)] flex items-center justify-center mb-4 group-hover:bg-[var(--accent-bg-hover)] transition-colors duration-200">
              <LineChart className="h-5 w-5 text-[var(--accent)]" />
            </div>
            <div className="text-lg font-semibold text-[var(--foreground)] mb-3 professional-heading">Clear Visuals</div>
            <p className="text-[var(--foreground-muted)] leading-relaxed professional-text">Charts and trends that make health patterns obvious at a glance.</p>
          </div>
          <div className="rounded-lg border border-[var(--card-border)] p-6 bg-[var(--background)] hover:shadow-md transition-all duration-200 group">
            <div className="w-10 h-10 rounded-lg bg-[var(--accent-bg)] flex items-center justify-center mb-4 group-hover:bg-[var(--accent-bg-hover)] transition-colors duration-200">
              <Brain className="h-5 w-5 text-[var(--accent)]" />
            </div>
            <div className="text-lg font-semibold text-[var(--foreground)] mb-3 professional-heading">Doctor Collaboration</div>
            <p className="text-[var(--foreground-muted)] leading-relaxed professional-text">Securely share insights with clinicians and export report-ready views.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
