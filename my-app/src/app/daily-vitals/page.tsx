"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function DailyVitalsPage() {
  const [sleep, setSleep] = useState(7);
  const [heartRate, setHeartRate] = useState(70);
  const [steps, setSteps] = useState(3000);
  const [mood, setMood] = useState(5);
  const [stress, setStress] = useState(3);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        date: new Date().toISOString().slice(0,10),
        sleep, heartRate, steps, mood, stress
      };
      const res = await fetch('/api/vitals', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (!res.ok) throw new Error('Failed to submit');
      router.replace('/dashboard/user');
    } catch (e) {
      alert('Failed to submit vitals');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-bold mb-4">Daily Vitals</h1>
      <Card>
        <CardHeader>
          <CardTitle>Share your daily vitals</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="grid gap-4">
            <div className="grid gap-2">
              <Label>Sleep (hours)</Label>
              <Input type="number" value={sleep} onChange={(e) => setSleep(Number(e.target.value))} min={0} max={24} />
            </div>
            <div className="grid gap-2">
              <Label>Heart rate (bpm)</Label>
              <Input type="number" value={heartRate} onChange={(e) => setHeartRate(Number(e.target.value))} min={20} max={220} />
            </div>
            <div className="grid gap-2">
              <Label>Steps</Label>
              <Input type="number" value={steps} onChange={(e) => setSteps(Number(e.target.value))} min={0} />
            </div>
            <div className="grid gap-2">
              <Label>Mood (1-10)</Label>
              <Input type="number" value={mood} onChange={(e) => setMood(Number(e.target.value))} min={1} max={10} />
            </div>
            <div className="grid gap-2">
              <Label>Stress (1-10)</Label>
              <Input type="number" value={stress} onChange={(e) => setStress(Number(e.target.value))} min={1} max={10} />
            </div>

            <div className="flex items-center gap-3">
              <Button type="submit" disabled={loading}>{loading ? 'Submitting...' : 'Submit Vitals'}</Button>
              <Button variant="ghost" type="button" onClick={() => router.replace('/dashboard/user')}>Skip</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
