"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useMemo, useState } from "react";
import { ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip } from "recharts";

type Patient = { id: string; name: string; alert?: string };
const patients: Patient[] = [
    { id: "p1", name: "Aarav Patel", alert: "High BP" },
    { id: "p2", name: "Meera Kapoor" },
    { id: "p3", name: "Rohan Singh", alert: "Stress spike" },
];

export default function AnalystPage() {
    const [query, setQuery] = useState("");
    const filtered = useMemo(() => patients.filter((p) => p.name.toLowerCase().includes(query.toLowerCase())), [query]);
    const series = useMemo(() => Array.from({ length: 10 }).map((_, i) => ({ t: i, hr: 70 + Math.round(Math.sin(i / 2) * 8 + Math.random() * 5), mood: 5 + Math.round(Math.cos(i / 3) * 2 + Math.random() * 2) })), []);

    return (
        <div className="grid gap-6 md:grid-cols-3">
            <div className="space-y-6">
                <Card>
                    <CardHeader><CardTitle>Patient List</CardTitle></CardHeader>
                    <CardContent>
                        <Input placeholder="Search patients" value={query} onChange={(e) => setQuery(e.target.value)} />
                        <div className="mt-3 space-y-2">
                            {filtered.map((p) => (
                                <div key={p.id} className="flex items-center justify-between rounded-md border border-slate-200 p-3 text-sm">
                                    <span>{p.name}</span>
                                    {p.alert ? (
                                        <span className="rounded bg-rose-50 px-2 py-0.5 text-rose-700 border border-rose-200">{p.alert}</span>
                                    ) : (
                                        <span className="rounded bg-emerald-50 px-2 py-0.5 text-emerald-700 border border-emerald-200">OK</span>
                                    )}
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
                <Button variant="secondary" className="w-full">Export PDF Report</Button>
            </div>
            <div className="md:col-span-2 space-y-6">
                <Card>
                    <CardHeader><CardTitle>Patient Vitals</CardTitle></CardHeader>
                    <CardContent style={{ height: 280 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={series}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="t" />
                                <YAxis />
                                <Tooltip />
                                <Line dataKey="hr" type="monotone" stroke="#b91c1c" dot={false} />
                                <Line dataKey="mood" type="monotone" stroke="#111111" dot={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader><CardTitle>AI Findings</CardTitle></CardHeader>
                    <CardContent className="text-sm text-slate-700 space-y-2">
                        <div>Confidence: 82%</div>
                        <div>Recommendation: review blood pressure trend; encourage stress management.</div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}


