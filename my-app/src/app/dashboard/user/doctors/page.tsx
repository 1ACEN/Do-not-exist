"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

type Doc = { id: string; name: string; specialization: string; contact: string };

export default function DashboardUserDoctorsPage() {
  const [doctors, setDoctors] = useState<Doc[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/doctors');
        if (res.ok) {
          const data = await res.json();
          setDoctors(data.items || []);
        }
      } catch (e) { console.error(e); }
      setLoading(false);
    };
    load();
  }, []);

  const assign = async (id: string) => {
    try {
      const res = await fetch('/api/assign-doctor', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ doctorId: id }) });
      if (res.ok) {
        // navigate to dashboard to see assigned doctor
        router.push('/dashboard');
      } else {
        const txt = await res.text();
        alert('Assign failed: ' + txt);
      }
    } catch (e) { console.error(e); alert('Assign failed'); }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Assign a Doctor</h1>
        <Link href="/dashboard" className="text-sm text-slate-600 hover:underline">Back to Dashboard</Link>
      </div>
      <div className="grid gap-4">
        {doctors.map(d => (
          <Card key={d.id}>
            <CardHeader>
              <CardTitle>{d.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-slate-600">{d.specialization}</div>
              <div className="mt-2 flex gap-2">
                <Button onClick={() => assign(d.id)}>Assign Doctor</Button>
                <Link href={`/doctor/${d.id}`} className="ml-2 text-sm text-slate-600 hover:underline">View profile</Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
