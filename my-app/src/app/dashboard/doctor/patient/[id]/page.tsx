"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">{patientInfo?.name ?? 'Patient'}</h1>
          {patientInfo && (
            <p className="text-sm text-slate-100 mt-1">{patientInfo.age ?? ''} years • {patientInfo.email ?? ''}</p>
          )}
          <div className="flex items-center gap-2 mt-3">
            <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-medium">Active</span>
            <span className="text-xs text-slate-100">Last sync: {patientInfo?.lastSeen ? new Date(patientInfo.lastSeen).toLocaleString() : '—'}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant={"ghost" as any} onClick={() => router.back()}>Back</Button>
          <Button onClick={() => window.print()}>Export PDF</Button>
        </div>
      </div>

      {loading ? (
        <Card>
          <CardContent>Loading patient details...</CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
          {/* Left column: Patient summary + conditions + prescriptions (30%) */}
          <div className="lg:col-span-3 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Patient</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <p className="text-sm text-slate-600">{patientInfo?.name}</p>
                  <p className="text-sm text-slate-600">{patientInfo?.email}</p>
                  {patientInfo?.age && <p className="text-sm text-slate-600">{patientInfo.age} years</p>}
                  {/* Vitals summary removed per request */}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Conditions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {(patientInfo?.conditions || []).length === 0 ? (
                    <p className="text-sm text-slate-500">No known conditions</p>
                  ) : (
                    (patientInfo.conditions || []).map((c: string) => (
                      <div key={c} className="text-sm text-slate-700">• {c}</div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Prescriptions moved here */}
            <Card>
              <CardHeader>
                <CardTitle>Prescriptions</CardTitle>
              </CardHeader>
              <CardContent>
                {presLoading ? (
                  <p className="text-sm text-slate-500">Loading prescriptions...</p>
                ) : prescriptions.length === 0 ? (
                  <div className="text-sm text-slate-500">No prescriptions found for this patient.</div>
                ) : (
                  <div className="space-y-3">
                    {prescriptions.map(p => (
                      <div key={p.id} className="p-3 rounded-md border flex items-start justify-between bg-white">
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <div className="font-medium text-slate-900">{p.medication}</div>
                            <div className={`text-xs font-medium px-2 py-0.5 rounded ${p.isCompleted ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>{p.isCompleted ? 'Completed' : 'Active'}</div>
                          </div>
                          <div className="text-sm text-slate-600 mt-1">{p.dosage ?? ''} {p.frequency ? `· ${p.frequency}` : ''}</div>
                          {p.duration && <div className="text-sm text-slate-600">Duration: {p.duration}</div>}
                          {p.prescribedDate && <div className="text-sm text-slate-500 mt-1">{new Date(p.prescribedDate).toLocaleDateString()}</div>}
                          {p.notes && <div className="text-sm text-slate-500 mt-1">{p.notes}</div>}
                        </div>
                        <div className="ml-4 flex flex-col items-end gap-2">
                          <label className="inline-flex items-center">
                            <input type="checkbox" checked={!!p.isCompleted} onChange={() => toggleComplete(p)} className="mr-2" />
                            <span className="text-sm">Done</span>
                          </label>
                          <Button variant={"ghost" as any} onClick={() => { navigator.clipboard?.writeText(p.notes || ''); }}>
                            Copy Notes
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right column: Charts (70%) */}
          <div className="lg:col-span-7">
            <Card className="h-full">
              <CardHeader>
                <CardTitle>Vitals Trends</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <AnalyticsCharts userId={id} />
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
