"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Line, LineChart, Tooltip, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Area, AreaChart } from "recharts";

const detections = Array.from({ length: 6 }).map((_, i) => ({
    id: i + 1,
    label: ["Hypertension Risk", "Arrhythmia", "Noisy Signal", "Cardiometabolic Risk"][i % 4],
    confidence: Math.round(60 + Math.random() * 35),
    time: new Date(Date.now() - i * 3600 * 1000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
}));

export default function DetectivePage() {
    const trend = useMemo(
        () =>
            Array.from({ length: 20 }).map((_, i) => ({
                t: i,
                risk: Math.round(20 + Math.random() * 70),
                forecast: Math.round(30 + Math.random() * 60),
            })),
        []
    );

    return (
        <div className="grid gap-6 md:grid-cols-3">
            <div className="md:col-span-2 space-y-6">
                <Card>
                    <CardHeader><CardTitle>Risk Forecast</CardTitle></CardHeader>
                    <CardContent style={{ height: 280 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={trend} margin={{ left: 4, right: 16, top: 8, bottom: 8 }}>
                                <defs>
                                    <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.5}/>
                                        <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="t" />
                                <YAxis />
                                <Tooltip />
                                <Area type="monotone" dataKey="forecast" stroke="#b91c1c" fillOpacity={1} fill="url(#colorRisk)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader><CardTitle>Deviation Alerts</CardTitle></CardHeader>
                    <CardContent>
                        <div className="grid sm:grid-cols-2 gap-3">
                            {trend.slice(-6).map((d, idx) => (
                                <div key={idx} className={`rounded-md border p-3 text-sm ${d.risk > 70 ? "border-rose-200 bg-rose-50 text-rose-800" : "border-emerald-200 bg-emerald-50 text-emerald-800"}`}>
                                    {d.risk > 70 ? "High deviation detected" : "Within expected deviation"}
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="space-y-6">
                <Card>
                    <CardHeader><CardTitle>Recent AI Detections</CardTitle></CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {detections.map((d) => (
                                <div key={d.id} className="flex items-center justify-between rounded-md border border-slate-200 p-3">
                                    <div>
                                        <div className="text-sm font-medium">{d.label}</div>
                                        <div className="text-xs text-slate-500">{d.time}</div>
                                    </div>
                                    <div className="text-sm text-slate-600">{d.confidence}%</div>
                                </div>
                            ))}
                            <Button className="w-full mt-2">Generate Report</Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}


