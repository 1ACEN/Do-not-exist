"use client";

import React, { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const ALL_SYMPTOMS = [
    "Itching","Shivering","Muscle Wasting","Vomiting","Fatigue","Sunken Eyes","Back Pain","Constipation","Mild Fever","Acute Liver Failure","Fluid Overload","Swelling Of Stomach","Blurred And Distorted Vision","Chest Pain","Cramps","Enlarged Thyroid","Knee Pain","Muscle Weakness","Unsteadiness","Bladder Discomfort","Passage Of Gases","Altered Sensorium","Mucoid Sputum","Pus Filled Pimples","Skin Peeling","Blister"
];

export default function DiagnoseDiseasePage() {
    const [query, setQuery] = useState("");
    const [selected, setSelected] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<{ prediction?: string | null; confidence?: string | null; note?: string | null; snippet?: string | null; error?: string | null } | null>(null);

    const filtered = useMemo(() => {
        const q = query.toLowerCase();
        if (!q) return ALL_SYMPTOMS;
        return ALL_SYMPTOMS.filter((s) => s.toLowerCase().includes(q));
    }, [query]);

    function toggleSymptom(s: string) {
        setSelected((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));
    }

    async function onDiagnose(e: React.FormEvent) {
        e.preventDefault();
        const symptoms = selected;
        if (symptoms.length === 0) {
            setResult({ error: "Please select at least one symptom.", prediction: null, snippet: null });
            return;
        }
        setLoading(true);
        try {
            const res = await fetch("/api/diagnose", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ symptoms }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data?.error || "Diagnosis failed");
            setResult({ 
                prediction: data.prediction, 
                confidence: data.confidence,
                note: data.note,
                error: null 
            });
        } catch (e: any) {
            setResult({ error: e?.message || "Diagnosis failed", prediction: null, confidence: null, note: null });
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="max-w-6xl mx-auto">
            <Card>
                <CardHeader>
                    <CardTitle>Diagnose Disease</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={onDiagnose} className="grid gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="search">Search symptoms</Label>
                            <Input id="search" placeholder="Type to filter..." value={query} onChange={(e) => setQuery(e.target.value)} />
                        </div>
                        <div className="rounded-md border border-slate-200 p-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                                {filtered.map((s) => (
                                    <label key={s} className="flex items-center gap-2 text-sm text-slate-800">
                                        <input type="checkbox" checked={selected.includes(s)} onChange={() => toggleSymptom(s)} className="h-4 w-4" />
                                        {s}
                                    </label>
                                ))}
                            </div>
                        </div>
                        <div className="text-xs text-slate-600">Selected: {selected.length}</div>
                        <Button type="submit" disabled={loading}>{loading ? "Diagnosing..." : "Predict Disease"}</Button>
                    </form>

                    {result?.error && (
                        <div className="mt-4 rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">{result.error}</div>
                    )}
                    {result && !result.error && (
                        <div className="mt-4 rounded-md border border-slate-200 bg-slate-50 p-3 text-sm text-slate-800">
                            <div className="font-medium">Prediction</div>
                            <div className="mt-1">{result.prediction ?? "No explicit prediction found in response."}</div>
                            {result.confidence && (
                                <div className="mt-2 text-slate-600">Confidence: <span className="font-medium">{result.confidence}</span></div>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}


