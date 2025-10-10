"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, LineChart as RechartsLineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip } from "recharts";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";

type Vital = { date: string; heartRate?: number; sleep?: number; steps?: number; mood?: number; stress?: number; systolic?: number; diastolic?: number };

export default function PatientChartsPage() {
  const pathname = usePathname();
  const parts = pathname.split('/');
  const id = parts[parts.length - 1];
  const [vitals, setVitals] = useState<Vital[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`/api/vitals/${id}`);
        if (!res.ok) throw new Error('fetch failed');
        const data = await res.json();
        const items = (data.items || []).map((it: any) => ({ ...it, date: new Date(it.date).toISOString().slice(0,10) }));
        setVitals(items.reverse());
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Patient Charts</h1>
        <div>
          <Button variant={"ghost" as any} onClick={() => router.back()}>Back</Button>
        </div>
      </div>

      {loading ? (
        <Card>
          <CardContent>Loading...</CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Heart Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div style={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsLineChart data={vitals}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="heartRate" stroke="#ef4444" strokeWidth={2} />
                  </RechartsLineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Blood Pressure (Systolic)</CardTitle>
            </CardHeader>
            <CardContent>
              <div style={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsLineChart data={vitals}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="systolic" stroke="#3b82f6" strokeWidth={2} />
                  </RechartsLineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
