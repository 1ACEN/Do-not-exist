"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";

type Doc = { id: string; name: string; specialization: string; contact?: string; description?: string };

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState<Doc[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const [assignedDoctorIds, setAssignedDoctorIds] = useState<string[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const [resDocs, resInfo] = await Promise.all([
          fetch('/api/doctors'),
          fetch('/api/doctor-info'),
        ]);

        if (resDocs.ok) {
          const data = await resDocs.json();
          setDoctors(data.items || []);
        }

        if (resInfo.ok) {
          const info = await resInfo.json();
          setAssignedDoctorIds(info.assignedDoctorIds || (info.doctor ? [info.doctor.id] : []));
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
        setAssignedDoctorIds(prev => Array.from(new Set([...prev, id])));
      } else {
        const txt = await res.text();
        alert('Assign failed: ' + txt);
      }
    } catch (e) { console.error(e); alert('Assign failed'); }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Available Doctors</h1>
  <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-2">
        {doctors.map(d => (
          <Card key={d.id} className={`overflow-hidden ${assignedDoctorIds.includes(d.id) ? 'border-2 border-emerald-100 bg-emerald-50/30' : ''}`}>
            <CardHeader className="px-6 py-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{d.name}</CardTitle>
                <div className="text-sm text-slate-500">{d.specialization}</div>
              </div>
            </CardHeader>
            <CardContent className="px-6 py-4">
              <p className="text-sm text-slate-600 mb-3">{d.description || 'Experienced clinician available for consultations and follow-ups.'}</p>
              <div className="mt-2 flex items-center gap-4">
                {assignedDoctorIds.includes(d.id) ? (
                  <div className="inline-flex items-center gap-2 text-emerald-600 font-medium">
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    Assigned
                  </div>
                ) : (
                  <Button onClick={() => assign(d.id)}>Assign Doctor</Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
