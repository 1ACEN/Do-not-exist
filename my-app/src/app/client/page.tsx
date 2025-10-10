"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { fetchPrediction } from "@/lib/api";
import { Activity, Droplet, Footprints, Heart, Smile, Timer } from "lucide-react";
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from "recharts";

type DailyLog = {
    date: string;
    sleep: number;
    heartRate: number;
    systolic: number;
    diastolic: number;
    steps: number;
    water: number;
    mood: number; // 1-10
    stress: number; // 1-10
};

const initialData: DailyLog[] = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return {
        date: d.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
        sleep: Math.round(6 + Math.random() * 3),
        heartRate: Math.round(65 + Math.random() * 20),
        systolic: Math.round(112 + Math.random() * 15),
        diastolic: Math.round(72 + Math.random() * 10),
        steps: Math.round(5000 + Math.random() * 6000),
        water: Math.round(6 + Math.random() * 4),
        mood: Math.round(5 + Math.random() * 5),
        stress: Math.round(2 + Math.random() * 6),
    } as DailyLog;
});

export default function ClientDashboardPage() {
    const [logs, setLogs] = useState<DailyLog[]>(initialData);
    const latest = logs[logs.length - 1];

    const [form, setForm] = useState({
        sleep: latest.sleep,
        heartRate: latest.heartRate,
        systolic: latest.systolic,
        diastolic: latest.diastolic,
        steps: latest.steps,
        water: latest.water,
        diet: "Balanced",
        mood: latest.mood,
        stress: latest.stress,
        notes: "",
    });

    const [prediction, setPrediction] = useState<{ label: string; accuracy: number; risk: number } | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [streak, setStreak] = useState(5);

    async function onSubmit() {
        setSubmitting(true);
        try {
            const res = await fetchPrediction({
                heartRate: form.heartRate,
                bloodPressureSys: form.systolic,
                bloodPressureDia: form.diastolic,
                sleep: form.sleep,
                stress: form.stress,
            });
            setPrediction({ label: res.predictedDisease, accuracy: res.accuracy, risk: res.riskScore });
            const today = new Date();
            const next: DailyLog = {
                date: today.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
                sleep: form.sleep,
                heartRate: form.heartRate,
                systolic: form.systolic,
                diastolic: form.diastolic,
                steps: form.steps,
                water: form.water,
                mood: form.mood,
                stress: form.stress,
            };
            setLogs((prev) => [...prev.slice(-6), next]);
            setStreak((s) => s + 1);
        } catch (e) {
            // TODO: toast
            console.error(e);
        } finally {
            setSubmitting(false);
        }
    }

    const moodRadar = useMemo(() => {
        return [
            { metric: "Mood", value: form.mood },
            { metric: "Stress", value: form.stress },
            { metric: "Sleep", value: Math.min(10, Math.round((form.sleep / 8) * 10)) },
        ];
    }, [form]);

    return (
        <div className="grid gap-6 md:grid-cols-3">
            <div className="md:col-span-2 space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Daily Health Tracker</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                                <Label>Sleep Duration (hrs)</Label>
                                <div className="mt-2 flex items-center gap-3">
                                    <Timer className="h-4 w-4 text-sky-600" />
                                    <Input type="number" value={form.sleep} onChange={(e) => setForm({ ...form, sleep: Number(e.target.value) })} />
                                </div>
                            </div>
                            <div>
                                <Label>Heart Rate (bpm)</Label>
                                <div className="mt-2 flex items-center gap-3">
                                    <Heart className="h-4 w-4 text-rose-600" />
                                    <Input type="number" value={form.heartRate} onChange={(e) => setForm({ ...form, heartRate: Number(e.target.value) })} />
                                </div>
                            </div>
                            <div>
                                <Label>Blood Pressure (sys/dia)</Label>
                                <div className="mt-2 grid grid-cols-2 gap-3">
                                    <Input placeholder="Systolic" type="number" value={form.systolic} onChange={(e) => setForm({ ...form, systolic: Number(e.target.value) })} />
                                    <Input placeholder="Diastolic" type="number" value={form.diastolic} onChange={(e) => setForm({ ...form, diastolic: Number(e.target.value) })} />
                                </div>
                            </div>
                            <div>
                                <Label>Step Count</Label>
                                <div className="mt-2 flex items-center gap-3">
                                    <Footprints className="h-4 w-4 text-emerald-600" />
                                    <Input type="number" value={form.steps} onChange={(e) => setForm({ ...form, steps: Number(e.target.value) })} />
                                </div>
                            </div>
                            <div>
                                <Label>Water Intake (glasses)</Label>
                                <div className="mt-2 flex items-center gap-3">
                                    <Droplet className="h-4 w-4 text-sky-600" />
                                    <Input type="number" value={form.water} onChange={(e) => setForm({ ...form, water: Number(e.target.value) })} />
                                </div>
                            </div>
                            <div>
                                <Label>Diet Pattern</Label>
                                <Input className="mt-2" value={form.diet} onChange={(e) => setForm({ ...form, diet: e.target.value })} />
                            </div>
                            <div className="sm:col-span-2">
                                <Label>Mood & Stress</Label>
                                <div className="mt-2 grid gap-4">
                                    <div className="flex items-center justify-between text-sm text-slate-600"><span className="flex items-center gap-2"><Smile className="h-4 w-4"/>Mood</span><span>{form.mood}/10</span></div>
                                    <Slider max={10} value={[form.mood]} onValueChange={(v) => setForm({ ...form, mood: v[0] ?? 5 })} />
                                    <div className="flex items-center justify-between text-sm text-slate-600"><span className="flex items-center gap-2"><Activity className="h-4 w-4"/>Stress</span><span>{form.stress}/10</span></div>
                                    <Slider max={10} value={[form.stress]} onValueChange={(v) => setForm({ ...form, stress: v[0] ?? 5 })} />
                                </div>
                            </div>
                        </div>
                        <div className="mt-6 flex items-center gap-3">
                            <Button onClick={onSubmit} disabled={submitting}>{submitting ? "Submitting..." : "Submit Log"}</Button>
                            <div className="text-sm text-slate-600">Streak: <span className="font-semibold">{streak} days</span></div>
                        </div>
                    </CardContent>
                </Card>

                <Tabs defaultValue="vitals">
                    <TabsList>
                        <TabsTrigger value="vitals">Vitals</TabsTrigger>
                        <TabsTrigger value="mood">Mood/Stress</TabsTrigger>
                    </TabsList>
                    <TabsContent value="vitals" className="grid gap-6 md:grid-cols-2">
                        <Card>
                            <CardHeader><CardTitle>Heart Rate (7 days)</CardTitle></CardHeader>
                            <CardContent style={{ height: 260 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={logs} margin={{ left: 4, right: 16, top: 8, bottom: 8 }}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="date" />
                                        <YAxis />
                                        <Tooltip />
                                    <Line type="monotone" dataKey="heartRate" stroke="#b91c1c" strokeWidth={2} dot={false} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader><CardTitle>Sleep (hrs)</CardTitle></CardHeader>
                            <CardContent style={{ height: 260 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={logs} margin={{ left: 4, right: 16, top: 8, bottom: 8 }}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="date" />
                                        <YAxis />
                                        <Tooltip />
                                        <Line type="monotone" dataKey="sleep" stroke="#111111" strokeWidth={2} dot={false} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </TabsContent>
                    <TabsContent value="mood" className="grid gap-6 md:grid-cols-2">
                        <Card>
                            <CardHeader><CardTitle>Mood/Stress Radar</CardTitle></CardHeader>
                            <CardContent style={{ height: 260 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <RadarChart data={moodRadar}>
                                        <PolarGrid />
                                        <PolarAngleAxis dataKey="metric" />
                                        <PolarRadiusAxis angle={30} domain={[0, 10]} />
                                        <Radar dataKey="value" stroke="#b91c1c" fill="#b91c1c" fillOpacity={0.5} />
                                    </RadarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader><CardTitle>Steps</CardTitle></CardHeader>
                            <CardContent style={{ height: 260 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={logs} margin={{ left: 4, right: 16, top: 8, bottom: 8 }}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="date" />
                                        <YAxis />
                                        <Tooltip />
                                        <Line type="monotone" dataKey="steps" stroke="#b91c1c" strokeWidth={2} dot={false} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>

            <div className="space-y-6">
                <Card>
                    <CardHeader><CardTitle>AI Prediction</CardTitle></CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            <div className="text-sm text-slate-600">Predicted Disease</div>
                            <div className="text-lg font-semibold">{prediction?.label ?? "—"}</div>
                            <div className="text-sm text-slate-600 mt-4">Accuracy</div>
                            <Progress value={prediction?.accuracy ?? 0} />
                            <div className="text-right text-sm text-slate-500">{prediction?.accuracy ? `${prediction.accuracy}%` : "Waiting..."}</div>
                            <div className="mt-4 rounded-md bg-sky-50 p-3 text-sm text-slate-700 border border-sky-100">
                                {prediction ? (
                                    <span>
                                        Recommendation: maintain consistent sleep and hydration. Consider a light cardio routine if stress persists.
                                    </span>
                                ) : (
                                    <span>Submit your daily log to see AI insights and tips.</span>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader><CardTitle>Alerts</CardTitle></CardHeader>
                    <CardContent>
                        <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">Your stress level has increased by 15% this week.</div>
                        <div className="mt-3 rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">Great job! You maintained a 5-day streak.</div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}


