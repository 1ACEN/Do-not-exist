"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import AnalyticsCharts from "@/components/analytics-charts";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";

type Prescription = {
  id: string;
  medication: string;
  dosage?: string;
  frequency?: string;
  duration?: string;
  prescribedDate?: string;
  notes?: string;
  isCompleted?: boolean;
  isActive?: boolean;
};

export default function PatientChartsPage() {
  const pathname = usePathname();
  const parts = pathname.split('/');
  const id = parts[parts.length - 1];
  const [patientInfo, setPatientInfo] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [presLoading, setPresLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    let mounted = true;
    const loadInfo = async () => {
      try {
        const res = await fetch(`/api/users/${id}`);
        if (!res.ok) return;
        const data = await res.json();
        if (!mounted) return;
        setPatientInfo(data.user || null);
      } catch (e) {
        console.error(e);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    loadInfo();
    return () => { mounted = false; };
  }, [id]);

  useEffect(() => {
    let mounted = true;
    const loadPrescriptions = async () => {
      setPresLoading(true);
      try {
        if (!id) {
          setPrescriptions([]);
          return;
        }
        const res = await fetch(`/api/prescriptions?userId=${id}`);
        if (!res.ok) {
          console.error('failed to fetch prescriptions', res.statusText);
          setPrescriptions([]);
          return;
        }
        const data = await res.json();
        if (!mounted) return;
        // API may return items or prescriptions depending on route implementation
        setPrescriptions(data.items || data.prescriptions || []);
      } catch (e) {
        console.error(e);
        setPrescriptions([]);
      } finally {
        if (mounted) setPresLoading(false);
      }
    };
    loadPrescriptions();
    return () => { mounted = false; };
  }, [id]);

  const toggleComplete = async (p: Prescription) => {
    const checked = !p.isCompleted;
    // optimistic update
    setPrescriptions(prev => prev.map(x => x.id === p.id ? { ...x, isCompleted: checked } : x));
    try {
      await fetch('/api/prescriptions', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: p.id, isCompleted: checked }) });
    } catch (e) {
      console.error(e);
      // revert on failure
      setPrescriptions(prev => prev.map(x => x.id === p.id ? { ...x, isCompleted: !!p.isCompleted } : x));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold">{patientInfo?.name ?? 'Patient Charts'}</h1>
          {patientInfo && (
            <p className="text-slate-600">{patientInfo.age ?? ''} years • {patientInfo.email ?? ''}</p>
          )}
        </div>
        <div>
          <Button variant={"ghost" as any} onClick={() => router.back()}>Back</Button>
        </div>
      </div>

      {loading ? (
        <Card>
          <CardContent>Loading...</CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Patient details */}
          <div>
            <Card className="bg-white rounded-lg shadow-sm border">
              <CardContent>
                <h3 className="text-lg font-semibold">Patient</h3>
                <p className="text-sm text-slate-600 mt-2">{patientInfo?.name}</p>
                <p className="text-sm text-slate-600">{patientInfo?.email}</p>
                {patientInfo?.age && <p className="text-sm text-slate-600">{patientInfo.age} years</p>}
                <div className="mt-4">
                  <Button variant={"ghost" as any} onClick={() => router.back()}>Back</Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts - span 2 cols on large screens */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <AnalyticsCharts userId={id} />
            </div>
          </div>

          {/* Prescriptions panel */}
          <div>
            <Card className="bg-white rounded-lg shadow-sm border">
              <CardContent>
                <h3 className="text-lg font-semibold">Prescriptions</h3>
                {presLoading ? (
                  <p className="text-sm text-slate-500 mt-2">Loading prescriptions...</p>
                ) : prescriptions.length === 0 ? (
                  <p className="text-sm text-slate-500 mt-2">No prescriptions found for this patient.</p>
                ) : (
                  <div className="space-y-3 mt-3">
                    {prescriptions.map(p => (
                      <div key={p.id} className="p-3 rounded-md border">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="font-medium">{p.medication}</div>
                            <div className="text-sm text-slate-600">{p.dosage ?? ''} {p.frequency ? `· ${p.frequency}` : ''}</div>
                            {p.duration && <div className="text-sm text-slate-600">Duration: {p.duration}</div>}
                            {p.prescribedDate && <div className="text-sm text-slate-500">{new Date(p.prescribedDate).toLocaleDateString()}</div>}
                            {p.notes && <div className="text-sm text-slate-500 mt-1">{p.notes}</div>}
                          </div>
                          <div className="ml-4 flex flex-col items-end">
                            <label className="inline-flex items-center">
                              <input type="checkbox" checked={!!p.isCompleted} onChange={() => toggleComplete(p)} className="mr-2" />
                              <span className="text-sm">Done</span>
                            </label>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
