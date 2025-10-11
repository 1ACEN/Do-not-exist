"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, 
  Activity, 
  Heart, 
  AlertTriangle, 
  TrendingUp, 
  FileText, 
  Download,
  Search,
  Filter,
  Calendar,
  Clock,
  Stethoscope,
  
  PieChart,
  LineChart,
  Eye,
  MessageSquare,
  CheckCircle,
  XCircle,
  Shield,
  Loader2
} from "lucide-react";
import Modal from '@/components/ui/modal';
// Recharts removed from this file to simplify the dashboard

type Patient = {
  id: string;
  name: string;
  age: number;
  gender: string;
  lastVisit: string;
  riskLevel: "low" | "medium" | "high";
  alerts: string[];
  vitals: {
    heartRate: number;
    bloodPressure: { systolic: number; diastolic: number };
    temperature: number;
    weight: number;
  };
  conditions: string[];
  medications: string[];
};

type PatientLog = {
  date: string;
  heartRate: number;
  systolic: number;
  diastolic: number;
  temperature: number;
  mood: number;
  stress: number;
  sleep: number;
};

const mockPatients: Patient[] = [
  {
    id: "p1",
    name: "Aarav Patel",
    age: 45,
    gender: "Male",
    lastVisit: "2024-01-15",
    riskLevel: "high",
    alerts: ["High BP", "Stress spike"],
    vitals: { heartRate: 95, bloodPressure: { systolic: 150, diastolic: 95 }, temperature: 98.6, weight: 75 },
    conditions: ["Hypertension", "Diabetes Type 2"],
    medications: ["Metformin", "Lisinopril"]
  },
  {
    id: "p2",
    name: "Meera Kapoor",
    age: 32,
    gender: "Female",
    lastVisit: "2024-01-14",
    riskLevel: "low",
    alerts: [],
    vitals: { heartRate: 72, bloodPressure: { systolic: 120, diastolic: 80 }, temperature: 98.4, weight: 58 },
    conditions: [],
    medications: []
  },
  {
    id: "p3",
    name: "Rohan Singh",
    age: 28,
    gender: "Male",
    lastVisit: "2024-01-13",
    riskLevel: "medium",
    alerts: ["Irregular sleep"],
    vitals: { heartRate: 85, bloodPressure: { systolic: 135, diastolic: 85 }, temperature: 98.2, weight: 70 },
    conditions: ["Anxiety"],
    medications: ["Sertraline"]
  },
  {
    id: "p4",
    name: "Priya Sharma",
    age: 55,
    gender: "Female",
    lastVisit: "2024-01-12",
    riskLevel: "high",
    alerts: ["High cholesterol", "Weight gain"],
    vitals: { heartRate: 88, bloodPressure: { systolic: 145, diastolic: 90 }, temperature: 98.5, weight: 68 },
    conditions: ["Hypertension", "Hyperlipidemia"],
    medications: ["Atorvastatin", "Amlodipine"]
  }
];

// Removed mock patient logs and PatientLog type (not used)

export default function DoctorDashboard() {
  const [patients, setPatients] = useState<Patient[]>(mockPatients);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [user, setUser] = useState<any>(null);
  const pathname = usePathname();
  // patientLogs state removed
  const [patientPrescriptions, setPatientPrescriptions] = useState<Array<{ id: string; medication: string; dosage?: string; frequency?: string; duration?: string; prescribedDate: string; notes?: string; isCompleted?: boolean; isActive?: boolean; }>>([]);
  const [loading, setLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);
  const [patientsFetchError, setPatientsFetchError] = useState<string | null>(null);
  const router = useRouter();
  // Quick prescribe state (used by the quick-prescribe card)
  const [quickPrescribeOpen, setQuickPrescribeOpen] = useState(false);
  const [quickPatientId, setQuickPatientId] = useState<string>("");
  const [quickMedication, setQuickMedication] = useState<string>("");
  const [quickNotes, setQuickNotes] = useState<string>("");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/me");
        const data = await res.json();
        
        if (data.user) {
          // Check if user has access to this dashboard
          if (data.user.role !== "doctor") {
            setAccessDenied(true);
            setLoading(false);
            return;
          }
          setUser(data.user);
        } else {
          // No user logged in, redirect to login
          router.push("/login");
        }
      } catch (error) {
        console.error("Failed to fetch user:", error);
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
    // Poll assigned patients for this doctor
    let mounted = true;
    const tick = async () => {
      try {
        const res = await fetch('/api/doctor/patients');
        if (!res.ok) {
          const text = await res.text().catch(() => "");
          if (mounted) setPatientsFetchError(`Failed to load patients: ${res.status} ${res.statusText} ${text}`);
          return;
        }
        const data = await res.json();
        if (!mounted) return;
        const items = (data.items || []).map((p: any) => ({ id: p.id, name: p.name, age: p.age || 0, gender: p.gender || 'Unknown', lastVisit: p.assignedDate || new Date().toISOString(), riskLevel: 'low', alerts: [], vitals: { heartRate: 0, bloodPressure: { systolic: 0, diastolic: 0 }, temperature: 98.6, weight: 0 }, conditions: [], medications: [] } as Patient));
        setPatients(items);
        setPatientsFetchError(items.length === 0 ? 'No patients assigned to this doctor.' : null);
      } catch (e) {
        if (mounted) setPatientsFetchError(String(e));
      }
    };
    tick();
    const id = setInterval(tick, 8000);
    return () => { mounted = false; clearInterval(id); };
  }, [router]);

  // Fetch prescriptions when a patient is selected
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (!selectedPatient) return setPatientPrescriptions([]);
      try {
        const res = await fetch(`/api/prescriptions?userId=${selectedPatient.id}`);
        if (!res.ok) return;
        const data = await res.json();
        if (!mounted) return;
        setPatientPrescriptions(data.items || []);
      } catch (e) { /* ignore */ }
    };
    load();
    return () => { mounted = false; };
  }, [selectedPatient]);

  // send prescription to a user
  const sendPrescription = async (userId: string, payload: { medication: string; dosage?: string; frequency?: string; duration?: string; notes?: string }) => {
    try {
      const res = await fetch('/api/prescriptions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId, ...payload }) });
      if (!res.ok) throw new Error('Failed');
      alert('Prescription sent');
    } catch (e) { console.error(e); alert('Failed to send prescription'); }
  };

  // send notice to all assigned patients
  const sendNotice = async (title: string, message: string) => {
    try {
      const res = await fetch('/api/doctor-notices', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title, message }) });
      if (!res.ok) throw new Error('Failed');
      alert('Notice sent');
    } catch (e) { console.error(e); alert('Failed to send notice'); }
  };

  // Modal state for prescription and notice
  const [prescriptionOpen, setPrescriptionOpen] = useState(false);
  const [noticeOpen, setNoticeOpen] = useState(false);
  const [prescriptionForm, setPrescriptionForm] = useState({ medication: '', dosage: '', frequency: '', duration: '', notes: '' });
  const [noticeForm, setNoticeForm] = useState({ title: '', message: '' });

  const openPrescriptionFor = (patientId: string) => {
    setSelectedPatient(patients.find(p => p.id === patientId) || null);
    setPrescriptionForm({ medication: '', dosage: '', frequency: '', duration: '', notes: '' });
    setPrescriptionOpen(true);
  };

  const submitPrescription = async () => {
    if (!selectedPatient) return;
    await sendPrescription(selectedPatient.id, { medication: prescriptionForm.medication, dosage: prescriptionForm.dosage, frequency: prescriptionForm.frequency, duration: prescriptionForm.duration, notes: prescriptionForm.notes });
    setPrescriptionOpen(false);
  };

  const openNotice = () => {
    setNoticeForm({ title: '', message: '' });
    setNoticeOpen(true);
  };

  const submitNotice = async () => {
    if (!noticeForm.message) return;
    await sendNotice(noticeForm.title || 'Important', noticeForm.message);
    setNoticeOpen(false);
  };

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="p-8">
          <CardContent className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <p className="text-slate-600">Loading your dashboard...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show access denied if user doesn't have permission
  if (accessDenied) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="p-8 max-w-md">
          <CardContent className="text-center">
            <Shield className="h-12 w-12 mx-auto mb-4 text-red-600" />
            <h2 className="text-xl font-semibold text-slate-900 mb-2">
              Access Denied
            </h2>
            <p className="text-slate-600 mb-6">
              This dashboard is only accessible to doctors/healthcare professionals. Please contact your administrator if you believe this is an error.
            </p>
            <Button onClick={() => router.push("/dashboard")}>
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const riskStats = {
    high: patients.filter(p => p.riskLevel === "high").length,
    medium: patients.filter(p => p.riskLevel === "medium").length,
    low: patients.filter(p => p.riskLevel === "low").length,
  };

  const totalAlerts = patients.reduce((acc, patient) => acc + patient.alerts.length, 0);

    // weeklyTrends removed (Weekly Activity card removed)

  const riskDistribution = [
    { name: "High Risk", value: riskStats.high, color: "#ef4444" },
    { name: "Medium Risk", value: riskStats.medium, color: "#f59e0b" },
    { name: "Low Risk", value: riskStats.low, color: "#10b981" },
  ];

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case "high": return "text-red-600 bg-red-50 border-red-200";
      case "medium": return "text-amber-600 bg-amber-50 border-amber-200";
      case "low": return "text-green-600 bg-green-50 border-green-200";
      default: return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const exportReport = () => {
    // Mock export functionality
    console.log("Exporting report for", selectedPatient?.name);
  };

  // small helper to create initials for avatar
  const getInitials = (name: string) => {
    if (!name) return "U";
    return name.split(" ").map(n => n[0]).slice(0,2).join("").toUpperCase();
  };

  return (
  <div className="space-y-6">
      {/* Header */}
  <div className="flex items-center justify-between p-6 rounded-xl shadow-lg bg-gradient-to-r from-white to-sky-50 border border-slate-100">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Doctor Dashboard
          </h1>
          <p className="text-slate-600 mt-1 max-w-xl">
            Welcome back, <span className="font-medium">Dr. {user?.name || "User"}</span>. Monitor your patients and track their health progress with quick actions and insights.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-sm text-slate-500">Total Patients</div>
            <div className="text-2xl font-bold text-blue-600">{patients.length}</div>
          </div>
          <div className="bg-white rounded-full p-2 shadow-md border">
            <Stethoscope className="h-7 w-7 text-slate-600" />
          </div>
        </div>
      </div>

      {/* Doctor dashboard sub-navigation */}
      {/* <nav aria-label="Doctor dashboard navigation" className="flex items-center gap-3">
        <Link href="/dashboard/doctor" className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150 ${pathname?.startsWith('/dashboard/doctor') ? 'bg-[var(--accent)] text-white' : 'text-[var(--foreground-muted)] hover:bg-[var(--accent-bg)] hover:text-[var(--accent)]'}`}>
          Dashboard
        </Link>
        {/* Patient Details (removed) */}
        {/* Analytics link removed as requested */}
      {/* </nav> */} 

      {/* Overview Stats */}
  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="shadow-sm border rounded-xl overflow-hidden">
          <CardContent className="p-6 bg-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Total Patients</p>
                <p className="text-2xl font-bold text-slate-900">{patients.length}</p>
                <p className="text-xs text-slate-400 mt-1">Active in your roster</p>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-3 rounded-lg shadow-inner">
                <Users className="h-7 w-7 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border rounded-xl overflow-hidden">
          <CardContent className="p-6 bg-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Active Alerts</p>
                <p className="text-2xl font-bold text-red-600">{totalAlerts}</p>
                <p className="text-xs text-slate-400 mt-1">Requires attention</p>
              </div>
              <div className="bg-red-50 p-3 rounded-lg shadow-inner">
                <AlertTriangle className="h-7 w-7 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border rounded-xl overflow-hidden">
          <CardContent className="p-6 bg-white flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Overview</p>
              <p className="text-2xl font-bold text-slate-900">Quick Insights</p>
              <p className="text-xs text-slate-400 mt-1">Key metrics and actions are available in the Quick Actions panel below.</p>
            </div>
            <div className="flex items-center gap-2">
              {/* Actions moved to Quick Actions panel to avoid duplication */}
            </div>
          </CardContent>
        </Card>
      </div>

  <div className="grid gap-6 lg:grid-cols-12">
        {/* Left: Patient List */}
        <div className="lg:col-span-4 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600" />
                Patient List
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 p-4 bg-white rounded-lg shadow-sm border">
              <div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input 
                    placeholder="Search patients..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <div className="space-y-2 max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 mt-3">
                  {filteredPatients.map((patient) => (
                    <div 
                      key={patient.id} 
                      className={`p-3 rounded-lg border cursor-pointer transition-all transform ${
                        selectedPatient?.id === patient.id 
                          ? "border-blue-500 bg-gradient-to-r from-white to-blue-50 shadow-md -translate-y-0.5" 
                          : "border-slate-100 hover:border-slate-200 hover:shadow-sm hover:-translate-y-0.5"
                      }`}
                      onClick={() => { setSelectedPatient(patient); router.push(`/dashboard/doctor/patient/${patient.id}`); }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full flex items-center justify-center text-white font-semibold" style={{ background: 'linear-gradient(135deg,#60a5fa,#7c3aed)' }}>
                            {getInitials(patient.name)}
                          </div>
                          <div>
                            <p className="font-medium text-slate-900">{patient.name}</p>
                            <p className="text-sm text-slate-600">{patient.age} years • {patient.gender}</p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getRiskColor(patient.riskLevel)}`}>
                            {patient.riskLevel.toUpperCase()}
                          </span>
                          {patient.alerts && patient.alerts.length > 0 && (
                            <span className="text-xs text-red-600 font-medium">
                              {patient.alerts.length} alert{patient.alerts.length > 1 ? 's' : ''}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  {patientsFetchError && (
                    <div className="p-3 mt-3 rounded-md border border-red-200 bg-red-50 text-red-800 text-sm">
                      {patientsFetchError}
                    </div>
                  )}
                  {!patientsFetchError && filteredPatients.length === 0 && (
                    <div className="p-6 text-center text-sm text-slate-600">
                      No patients found. Ensure you are logged in as a doctor and that patients have been assigned to your account.
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right: Actions and Insights */}
        <div className="lg:col-span-8 space-y-6">
          <div className="grid gap-6 md:grid-cols-1">
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="space-y-1">
                    <p className="text-sm text-slate-600">Prescribe or notify patients quickly.</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Button onClick={() => setQuickPrescribeOpen(true)}>Quick Prescribe</Button>
                      <Button variant={"ghost" as any} onClick={() => setNoticeOpen(true)}>Send Notice</Button>
                      <Button variant={"outline" as any} onClick={exportReport}>Export</Button>
                    </div>
                  </div>
                  <div className="hidden sm:flex items-center">
                    {/* reserved for a small illustration or sparkline if needed */}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Weekly Activity removed to declutter the dashboard */}
        </div>
      </div>
      {/* Prescription Modal */}
      <Modal open={prescriptionOpen} onClose={() => setPrescriptionOpen(false)} title={`Send Prescription to ${selectedPatient?.name || ''}`} footer={(
        <div className="flex justify-end gap-2">
          <button className="px-3 py-1.5 rounded border" onClick={() => setPrescriptionOpen(false)}>Cancel</button>
          <button className="px-3 py-1.5 rounded bg-blue-600 text-white" onClick={submitPrescription}>Send</button>
        </div>
      )}>
        <div className="space-y-3">
          <div>
            <Label>Medication</Label>
            <Input value={prescriptionForm.medication} onChange={(e) => setPrescriptionForm({ ...prescriptionForm, medication: e.target.value })} placeholder="Medication name" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label>Dosage</Label>
              <Input value={prescriptionForm.dosage} onChange={(e) => setPrescriptionForm({ ...prescriptionForm, dosage: e.target.value })} placeholder="e.g. 500mg" />
            </div>
            <div>
              <Label>Frequency</Label>
              <Input value={prescriptionForm.frequency} onChange={(e) => setPrescriptionForm({ ...prescriptionForm, frequency: e.target.value })} placeholder="e.g. Twice daily" />
            </div>
          </div>
          <div>
            <Label>Duration</Label>
            <Input value={prescriptionForm.duration} onChange={(e) => setPrescriptionForm({ ...prescriptionForm, duration: e.target.value })} placeholder="e.g. 30 days" />
          </div>
          <div>
            <Label>Notes</Label>
            <Input value={prescriptionForm.notes} onChange={(e) => setPrescriptionForm({ ...prescriptionForm, notes: e.target.value })} placeholder="Additional notes (optional)" />
          </div>
        </div>
      </Modal>

      {/* Quick Prescribe Modal (triggered from Overview card) */}
      <Modal open={quickPrescribeOpen} onClose={() => setQuickPrescribeOpen(false)} title={"Quick Prescribe"} footer={(
        <div className="flex justify-end gap-2">
          <button className="px-3 py-1.5 rounded border" onClick={() => setQuickPrescribeOpen(false)}>Cancel</button>
          <button className="px-3 py-1.5 rounded bg-blue-600 text-white" onClick={async () => {
            if (!quickPatientId || !quickMedication) { alert('Please select a patient and enter medication'); return; }
            await sendPrescription(quickPatientId, { medication: quickMedication, notes: quickNotes });
            setQuickPrescribeOpen(false);
            setQuickPatientId(''); setQuickMedication(''); setQuickNotes('');
          }}>Send</button>
        </div>
      )}>
        <div className="space-y-3">
          <div>
            <Label>Patient</Label>
            <select className="w-full border rounded px-2 py-1" value={quickPatientId} onChange={(e) => setQuickPatientId(e.target.value)}>
              <option value="">Select patient</option>
              {patients.map(p => (
                <option key={p.id} value={p.id}>{p.name} {p.age ? `· ${p.age}y` : ''}</option>
              ))}
            </select>
          </div>
          <div>
            <Label>Medication</Label>
            <Input value={quickMedication} onChange={(e) => setQuickMedication(e.target.value)} placeholder="Medication name e.g. Amoxicillin" />
          </div>
          <div>
            <Label>Notes</Label>
            <Input value={quickNotes} onChange={(e) => setQuickNotes(e.target.value)} placeholder="Optional notes" />
          </div>
        </div>
      </Modal>

      {/* Notice Modal */}
      <Modal open={noticeOpen} onClose={() => setNoticeOpen(false)} title={"Send Notice to All Assigned Patients"} footer={(
        <div className="flex justify-end gap-2">
          <button className="px-3 py-1.5 rounded border" onClick={() => setNoticeOpen(false)}>Cancel</button>
          <button className="px-3 py-1.5 rounded bg-blue-600 text-white" onClick={submitNotice}>Send</button>
        </div>
      )}>
        <div className="space-y-3">
          <div>
            <Label>Title</Label>
            <Input value={noticeForm.title} onChange={(e) => setNoticeForm({ ...noticeForm, title: e.target.value })} placeholder="Notice title" />
          </div>
          <div>
            <Label>Message</Label>
            <Input value={noticeForm.message} onChange={(e) => setNoticeForm({ ...noticeForm, message: e.target.value })} placeholder="Message" />
          </div>
        </div>
      </Modal>
    </div>
  );
}
