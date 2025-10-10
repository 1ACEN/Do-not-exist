"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

const steps = [
    { id: 1, label: "How energetic did you feel today?" },
    { id: 2, label: "How stressed do you feel?" },
    { id: 3, label: "How well did you sleep last night?" },
];

export default function SurveysPage() {
    const [index, setIndex] = useState(0);
    const [answers, setAnswers] = useState<number[]>(Array(steps.length).fill(5));

    const progress = Math.round(((index + 1) / steps.length) * 100);

    function next() {
        setIndex((i) => Math.min(steps.length - 1, i + 1));
    }
    function prev() {
        setIndex((i) => Math.max(0, i - 1));
    }

    return (
        <div className="max-w-2xl mx-auto">
            <Card>
                <CardHeader>
                    <CardTitle>Self-Assessment</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="mb-4 h-2 w-full rounded-full bg-slate-200 overflow-hidden">
                        <div className="h-full bg-sky-500" style={{ width: `${progress}%` }} />
                    </div>
                    <div className="text-slate-700 mb-6">{steps[index].label}</div>
                    <Slider max={10} value={[answers[index]]} onValueChange={(v) => setAnswers((a) => a.map((x, i) => (i === index ? v[0] ?? x : x)))} />
                    <div className="mt-6 flex items-center justify-between">
                        <Button variant="outline" onClick={prev} disabled={index === 0}>Back</Button>
                        {index < steps.length - 1 ? (
                            <Button onClick={next}>Next</Button>
                        ) : (
                            <Button onClick={() => alert(`Your Wellness Snapshot: ${Math.round(answers.reduce((s, x) => s + x, 0) / answers.length)} / 10`)}>Finish</Button>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}


