"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMemo } from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from "recharts";

export default function AdminAnalyticsPage() {
    const kpis = { users: 1280, predictions: 4820, active: 76 };
    const trends = useMemo(() => Array.from({ length: 6 }).map((_, i) => ({ label: `W${i + 1}`, value: Math.round(20 + Math.random() * 80) })), []);
    const risks = [
        { name: "Hypertension", value: 34 },
        { name: "Arrhythmia", value: 26 },
        { name: "Metabolic", value: 18 },
        { name: "Other", value: 22 },
    ];
    const colors = ["#0284c7", "#10b981", "#f59e0b", "#94a3b8"];

    return (
        <div className="grid gap-6 md:grid-cols-3">
            <div className="grid gap-6 md:col-span-3 sm:grid-cols-3">
                <Card><CardHeader><CardTitle>Total Users</CardTitle></CardHeader><CardContent className="text-3xl font-semibold">{kpis.users}</CardContent></Card>
                <Card><CardHeader><CardTitle>Diseases Predicted</CardTitle></CardHeader><CardContent className="text-3xl font-semibold">{kpis.predictions}</CardContent></Card>
                <Card><CardHeader><CardTitle>% Active</CardTitle></CardHeader><CardContent className="text-3xl font-semibold">{kpis.active}%</CardContent></Card>
            </div>

            <Card className="md:col-span-2">
                <CardHeader><CardTitle>Common Risk Trends</CardTitle></CardHeader>
                <CardContent style={{ height: 280 }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={trends}>
                            <XAxis dataKey="label" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="value" fill="#b91c1c" radius={[6,6,0,0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            <Card>
                <CardHeader><CardTitle>Risk Breakdown</CardTitle></CardHeader>
                <CardContent style={{ height: 280 }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie data={risks} dataKey="value" nameKey="name" outerRadius={90} label>
                                {risks.map((_, i) => (
                                    <Cell key={i} fill={colors[i % colors.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </div>
    );
}


