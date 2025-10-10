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
  BarChart3,
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
import { 
  ResponsiveContainer, 
  LineChart as RechartsLineChart, 
  Line, 
  CartesianGrid, 
  XAxis, 
  YAxis, 
  Tooltip, 
  BarChart, 
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from "recharts";

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

const mockPatientLogs: PatientLog[] = Array.from({ length: 30 }).map((_, i) => {
  const d = new Date();
  d.setDate(d.getDate() - (29 - i));
  return {
    date: d.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
    heartRate: Math.round(70 + Math.random() * 30),
    systolic: Math.round(110 + Math.random() * 40),
    diastolic: Math.round(70 + Math.random() * 20),
    temperature: Math.round((98 + Math.random() * 2) * 10) / 10,
    mood: Math.round(5 + Math.random() * 5),
    stress: Math.round(2 + Math.random() * 6),
    sleep: Math.round(6 + Math.random() * 3),
  };
});

export default function DoctorDashboard() {
  const [patients, setPatients] = useState<Patient[]>(mockPatients);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [user, setUser] = useState<any>(null);
  const pathname = usePathname();
  const [patientLogs, setPatientLogs] = useState<PatientLog[]>(mockPatientLogs);
  const [patientPrescriptions, setPatientPrescriptions] = useState<Array<{ id: string; medication: string; dosage?: string; frequency?: string; duration?: string; prescribedDate: string; notes?: string; isCompleted?: boolean; isActive?: boolean; }>>([]);
  const [loading, setLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);
  const router = useRouter();

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
        if (!res.ok) return;
        const data = await res.json();
        if (!mounted) return;
        const items = (data.items || []).map((p: any) => ({ id: p.id, name: p.name, age: p.age || 0, gender: p.gender || 'Unknown', lastVisit: p.assignedDate || new Date().toISOString(), riskLevel: 'low', alerts: [], vitals: { heartRate: 0, bloodPressure: { systolic: 0, diastolic: 0 }, temperature: 98.6, weight: 0 }, conditions: [], medications: [] } as Patient));
        setPatients(items);
      } catch (e) {
        // ignore
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

  const weeklyTrends = [
    { day: "Mon", patients: 12, alerts: 3 },
    { day: "Tue", patients: 15, alerts: 5 },
    { day: "Wed", patients: 18, alerts: 2 },
    { day: "Thu", patients: 14, alerts: 4 },
    { day: "Fri", patients: 16, alerts: 6 },
    { day: "Sat", patients: 8, alerts: 1 },
    { day: "Sun", patients: 5, alerts: 0 },
  ];

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
      <div className="flex items-center justify-between bg-gradient-to-r from-sky-50 via-white to-rose-50 p-6 rounded-lg shadow-sm">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Doctor Dashboard
          </h1>
          <p className="text-slate-600 mt-1 max-w-xl">
            Welcome back, Dr. {user?.name || "User"}. Monitor your patients and track their health progress with quick actions and insights.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-sm text-slate-500">Total Patients</div>
            <div className="text-2xl font-bold text-blue-600">{patients.length}</div>
          </div>
          <div className="bg-white rounded-full p-2 shadow">
            <Stethoscope className="h-7 w-7 text-slate-500" />
          </div>
        </div>
      </div>

      {/* Doctor dashboard sub-navigation */}
      <nav aria-label="Doctor dashboard navigation" className="flex items-center gap-3">
        <Link href="/dashboard/doctor" className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150 ${pathname?.startsWith('/dashboard/doctor') ? 'bg-[var(--accent)] text-white' : 'text-[var(--foreground-muted)] hover:bg-[var(--accent-bg)] hover:text-[var(--accent)]'}`}>
          Dashboard
        </Link>
        <Link href={selectedPatient ? `/dashboard/doctor/patient/${selectedPatient.id}` : '#'} className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150 ${pathname?.startsWith('/dashboard/doctor/patient') ? 'bg-[var(--accent)] text-white' : 'text-[var(--foreground-muted)] hover:bg-[var(--accent-bg)] hover:text-[var(--accent)]'} ${!selectedPatient ? 'opacity-50 pointer-events-none' : ''}`}>
          Patient Details
        </Link>
        <Link href="/admin" className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150 ${pathname?.startsWith('/admin') ? 'bg-[var(--accent)] text-white' : 'text-[var(--foreground-muted)] hover:bg-[var(--accent-bg)] hover:text-[var(--accent)]'}`}>
          Analytics
        </Link>
      </nav>

      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="shadow-md border-0 rounded-lg overflow-hidden">
          <CardContent className="p-6 bg-gradient-to-b from-white to-sky-50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total Patients</p>
                <p className="text-2xl font-bold text-slate-900">{patients.length}</p>
              </div>
              <div className="bg-blue-50 p-2 rounded-md">
                <Users className="h-7 w-7 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-md border-0 rounded-lg overflow-hidden">
          <CardContent className="p-6 bg-gradient-to-b from-white to-rose-50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Active Alerts</p>
                <p className="text-2xl font-bold text-red-600">{totalAlerts}</p>
              </div>
              <div className="bg-red-50 p-2 rounded-md">
                <AlertTriangle className="h-7 w-7 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-md border-0 rounded-lg overflow-hidden">
          <CardContent className="p-6 bg-gradient-to-b from-white to-emerald-50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Overview</p>
                <p className="text-2xl font-bold text-slate-900">Quick Insights</p>
                <p className="text-xs text-slate-500 mt-1">Risk: {riskStats.high} high • {riskStats.medium} medium • {riskStats.low} low</p>
              </div>
              <div className="bg-emerald-50 p-2 rounded-md">
                <BarChart3 className="h-7 w-7 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Patient List */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600" />
                Patient List
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input 
                    placeholder="Search patients..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {filteredPatients.map((patient) => (
                    <div 
                      key={patient.id} 
                      className={`p-3 rounded-lg border cursor-pointer transition-all transform ${
                        selectedPatient?.id === patient.id 
                          ? "border-blue-500 bg-blue-50 shadow-md -translate-y-0.5" 
                          : "border-slate-200 hover:border-slate-300 hover:shadow-sm hover:-translate-y-0.5"
                      }`}
                      onClick={() => setSelectedPatient(patient)}
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
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Risk Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Risk Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div style={{ height: 200 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={riskDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {riskDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Patient Details */}
        <div className="lg:col-span-2 space-y-6">
          {selectedPatient ? (
            <>
              {/* Patient Header */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-xl">{selectedPatient.name}</CardTitle>
                      <p className="text-slate-600">
                        {selectedPatient.age} years • {selectedPatient.gender} • 
                        Last visit: {new Date(selectedPatient.lastVisit).toLocaleDateString()}
                      </p>
                    </div>
                      <div className="flex items-center gap-2">
                      <button className="inline-flex items-center gap-2 rounded-md bg-blue-600 text-white px-3 py-1.5 text-sm hover:bg-blue-700" onClick={() => { openPrescriptionFor(selectedPatient!.id); }}>
                        <MessageSquare className="h-4 w-4" />
                        Send Prescription
                      </button>
                      <button className="inline-flex items-center gap-2 rounded-md border border-slate-200 px-3 py-1.5 text-sm hover:bg-slate-50" onClick={() => { openNotice(); }}>
                        <FileText className="h-4 w-4" />
                        Send Notice
                      </button>
                      <button className="inline-flex items-center gap-2 rounded-md border border-slate-200 px-3 py-1.5 text-sm hover:bg-slate-50" onClick={() => router.push(`/dashboard/doctor/patient/${selectedPatient.id}`)}>
                        <BarChart3 className="h-4 w-4" />
                        View Charts
                      </button>
                      <Button size="sm" variant={"ghost" as any} onClick={exportReport}>
                        <Download className="h-4 w-4 mr-2" />
                        Export Report
                      </Button>
                    </div>
                  </div>
                </CardHeader>
              </Card>

              {/* Patient Tabs */}
              <Tabs defaultValue="overview">
                <TabsList>
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="vitals">Vitals</TabsTrigger>
                  <TabsTrigger value="trends">Trends</TabsTrigger>
                  <TabsTrigger value="medical">Medical Info</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    {/* Current Vitals */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Current Vitals</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-slate-600">Heart Rate</span>
                            <span className="font-semibold">{selectedPatient.vitals.heartRate} bpm</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-slate-600">Blood Pressure</span>
                            <span className="font-semibold">
                              {selectedPatient.vitals.bloodPressure.systolic}/{selectedPatient.vitals.bloodPressure.diastolic}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-slate-600">Temperature</span>
                            <span className="font-semibold">{selectedPatient.vitals.temperature}°F</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-slate-600">Weight</span>
                            <span className="font-semibold">{selectedPatient.vitals.weight} kg</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Alerts */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <AlertTriangle className="h-5 w-5 text-red-600" />
                          Active Alerts
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {selectedPatient.alerts.length > 0 ? (
                          <div className="space-y-2">
                            {selectedPatient.alerts.map((alert, index) => (
                              <div key={index} className="p-2 bg-red-50 border border-red-200 rounded text-sm text-red-800">
                                {alert}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-4 text-slate-500">
                            <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-600" />
                            <p>No active alerts</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>

                  {/* Prescriptions for this patient */}
                  {patientPrescriptions.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Prescriptions</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {patientPrescriptions.map(p => (
                            <div key={p.id} className={`p-3 rounded-lg border ${p.isCompleted ? 'bg-gray-100 border-gray-200 text-gray-600 line-through' : 'bg-green-50 border-green-200 text-green-900'}`}>
                              <div className="flex items-start justify-between">
                                <div>
                                  <div className="font-medium">{p.medication}</div>
                                  <div className="text-sm">{p.dosage} • {p.frequency} • {p.duration}</div>
                                  {p.notes && <div className="text-xs italic">{p.notes}</div>}
                                </div>
                                <div>
                                  <label className="inline-flex items-center gap-2 text-sm">
                                    <input type="checkbox" checked={Boolean(p.isCompleted)} onChange={async (e) => {
                                      const checked = e.target.checked;
                                      setPatientPrescriptions(prev => prev.map(x => x.id === p.id ? { ...x, isCompleted: checked } : x));
                                      try {
                                        const res = await fetch('/api/prescriptions', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: p.id, isCompleted: checked }) });
                                        if (!res.ok) {
                                          setPatientPrescriptions(prev => prev.map(x => x.id === p.id ? { ...x, isCompleted: !checked } : x));
                                          alert('Failed to update prescription');
                                        }
                                      } catch (err) {
                                        setPatientPrescriptions(prev => prev.map(x => x.id === p.id ? { ...x, isCompleted: !checked } : x));
                                        console.error(err);
                                        alert('Failed to update prescription');
                                      }
                                    }} />
                                    <span className="text-xs">Completed</span>
                                  </label>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Weekly Activity */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Weekly Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div style={{ height: 300 }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={weeklyTrends}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="day" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="patients" fill="#3b82f6" />
                            <Bar dataKey="alerts" fill="#ef4444" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="vitals" className="space-y-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    <Card>
                      <CardHeader>
                        <CardTitle>Heart Rate Trend</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div style={{ height: 250 }}>
                          <ResponsiveContainer width="100%" height="100%">
                            <RechartsLineChart data={patientLogs}>
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
                        <CardTitle>Blood Pressure Trend</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div style={{ height: 250 }}>
                          <ResponsiveContainer width="100%" height="100%">
                            <RechartsLineChart data={patientLogs}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="date" />
                              <YAxis />
                              <Tooltip />
                              <Line type="monotone" dataKey="systolic" stroke="#ef4444" strokeWidth={2} />
                              <Line type="monotone" dataKey="diastolic" stroke="#3b82f6" strokeWidth={2} />
                            </RechartsLineChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="trends" className="space-y-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    <Card>
                      <CardHeader>
                        <CardTitle>Sleep Pattern</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div style={{ height: 250 }}>
                          <ResponsiveContainer width="100%" height="100%">
                            <RechartsLineChart data={patientLogs}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="date" />
                              <YAxis />
                              <Tooltip />
                              <Line type="monotone" dataKey="sleep" stroke="#8b5cf6" strokeWidth={2} />
                            </RechartsLineChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Mood & Stress</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div style={{ height: 250 }}>
                          <ResponsiveContainer width="100%" height="100%">
                            <RechartsLineChart data={patientLogs}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="date" />
                              <YAxis />
                              <Tooltip />
                              <Line type="monotone" dataKey="mood" stroke="#10b981" strokeWidth={2} />
                              <Line type="monotone" dataKey="stress" stroke="#f59e0b" strokeWidth={2} />
                            </RechartsLineChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="medical" className="space-y-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    <Card>
                      <CardHeader>
                        <CardTitle>Medical Conditions</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {selectedPatient.conditions.length > 0 ? (
                          <div className="space-y-2">
                            {selectedPatient.conditions.map((condition, index) => (
                              <div key={index} className="p-2 bg-slate-50 border border-slate-200 rounded text-sm">
                                {condition}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-slate-500">No conditions recorded</p>
                        )}
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Current Medications</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {selectedPatient.medications.length > 0 ? (
                          <div className="space-y-2">
                            {selectedPatient.medications.map((medication, index) => (
                              <div key={index} className="p-2 bg-blue-50 border border-blue-200 rounded text-sm">
                                {medication}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-slate-500">No medications recorded</p>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              </Tabs>
            </>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <Eye className="h-12 w-12 mx-auto mb-4 text-slate-400" />
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Select a Patient</h3>
                <p className="text-slate-600">Choose a patient from the list to view their detailed health information and trends.</p>
              </CardContent>
            </Card>
          )}
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
