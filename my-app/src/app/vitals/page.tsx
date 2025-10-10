"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Vital = {
    date: string;
    sleep: number;
    heartRate: number;
    steps: number;
    water: number;
    diet: string;
    mood: number;
    stress: number;
    notes?: string;
};

export default function VitalsPage() {
    const [form, setForm] = useState<Vital>({
        date: new Date().toISOString().slice(0, 10),
        sleep: 7,
        heartRate: 72,
        steps: 5000,
        water: 8,
        diet: "Balanced",
        mood: 5,
        stress: 3,
        notes: "",
    });
    const [submitting, setSubmitting] = useState(false);
    const [items, setItems] = useState<Vital[]>([]);

    async function load() {
        const res = await fetch("/api/vitals", { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        setItems(data.items || []);
    }
    useEffect(() => {
        load();
    }, []);

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        setSubmitting(true);
        try {
            const res = await fetch("/api/vitals", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });
            if (!res.ok) throw new Error("Failed to save vitals");
            await load();
        } catch (e) {
            console.error(e);
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div className="grid gap-6 md:grid-cols-3">
            <Card className="md:col-span-1">
                <CardHeader>
                    <CardTitle>Log Daily Vitals</CardTitle>
                </CardHeader>
                <CardContent>
                    <form className="grid gap-4" onSubmit={onSubmit}>
                        <div className="grid gap-2">
                            <Label htmlFor="date">Date</Label>
                            <Input id="date" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="sleep">Sleep Duration (hrs)</Label>
                            <Input id="sleep" type="number" value={form.sleep} onChange={(e) => setForm({ ...form, sleep: Number(e.target.value) })} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="hr">Heart Rate (bpm)</Label>
                            <Input id="hr" type="number" value={form.heartRate} onChange={(e) => setForm({ ...form, heartRate: Number(e.target.value) })} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="steps">Step Count</Label>
                            <Input id="steps" type="number" value={form.steps} onChange={(e) => setForm({ ...form, steps: Number(e.target.value) })} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="water">Water Intake (glasses)</Label>
                            <Input id="water" type="number" value={form.water} onChange={(e) => setForm({ ...form, water: Number(e.target.value) })} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="diet">Diet Pattern</Label>
                            <Input id="diet" value={form.diet} onChange={(e) => setForm({ ...form, diet: e.target.value })} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="mood">Mood (1-10)</Label>
                            <Input id="mood" type="number" min={1} max={10} value={form.mood} onChange={(e) => setForm({ ...form, mood: Number(e.target.value) })} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="stress">Stress (1-10)</Label>
                            <Input id="stress" type="number" min={1} max={10} value={form.stress} onChange={(e) => setForm({ ...form, stress: Number(e.target.value) })} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="notes">Notes</Label>
                            <Input id="notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
                        </div>
                        <Button type="submit" disabled={submitting}>{submitting ? "Saving..." : "Save"}</Button>
                    </form>
                </CardContent>
            </Card>

            <Card className="md:col-span-2">
                <CardHeader>
                    <CardTitle>Recent Entries</CardTitle>
                </CardHeader>
                <CardContent>
                    {items.length === 0 ? (
                        <div className="text-sm text-slate-600">No entries yet.</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="text-left text-slate-600">
                                    <tr>
                                        <th className="py-2">Date</th>
                                        <th className="py-2">Sleep</th>
                                        <th className="py-2">HR</th>
                                        <th className="py-2">Steps</th>
                                        <th className="py-2">Water</th>
                                        <th className="py-2">Diet</th>
                                        <th className="py-2">Mood</th>
                                        <th className="py-2">Stress</th>
                                        <th className="py-2">Notes</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {items.map((it: any, idx) => (
                                        <tr key={idx} className="border-t border-slate-200">
                                            <td className="py-1">{new Date(it.date).toLocaleDateString()}</td>
                                            <td className="py-1">{it.sleep} h</td>
                                            <td className="py-1">{it.heartRate}</td>
                                            <td className="py-1">{it.steps}</td>
                                            <td className="py-1">{it.water} glass</td>
                                            <td className="py-1">{it.diet}</td>
                                            <td className="py-1">{it.mood}</td>
                                            <td className="py-1">{it.stress}</td>
                                            <td className="py-1">{it.notes}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}


