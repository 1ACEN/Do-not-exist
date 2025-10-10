"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
  const [patientLogs, setPatientLogs] = useState<PatientLog[]>(mockPatientLogs);
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
    // fetch patients after user loads
    const fetchPatients = async () => {
      try {
        const res = await fetch("/api/patients");
        if (res.ok) {
          const data = await res.json();
          const items = (data.items || []).map((it: any) => ({
            ...it,
            id: it._id ? String(it._1?._id ?? it._id) : it.id ?? String(it._id ?? ""),
            // normalize common fields
            riskLevel: it.riskLevel ?? "low",
            alerts: it.alerts ?? [],
            vitals: it.vitals ?? { heartRate: 0, bloodPressure: { systolic: 0, diastolic: 0 }, temperature: 98.6, weight: 0 },
            lastVisit: it.lastVisit ?? new Date().toISOString(),
          } as Patient));
          setPatients(items);
        }
      } catch (e) {
        console.error("Failed to load patients", e);
      }
    };
    // keeping mockPatients for now; backend patients were removed per request
  }, [router]);

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Doctor Dashboard
          </h1>
          <p className="text-slate-600 mt-1">
            Welcome back, Dr. {user?.name || "User"}. Monitor your patients and track their health progress.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-sm text-slate-600">Total Patients</div>
            <div className="text-2xl font-bold text-blue-600">{patients.length}</div>
          </div>
          <Stethoscope className="h-8 w-8 text-slate-400" />
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total Patients</p>
                <p className="text-2xl font-bold text-slate-900">{patients.length}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Active Alerts</p>
                <p className="text-2xl font-bold text-red-600">{totalAlerts}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">High Risk</p>
                <p className="text-2xl font-bold text-red-600">{riskStats.high}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Reports Generated</p>
                <p className="text-2xl font-bold text-green-600">24</p>
              </div>
              <FileText className="h-8 w-8 text-green-600" />
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
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedPatient?.id === patient.id 
                          ? "border-blue-500 bg-blue-50" 
                          : "border-slate-200 hover:border-slate-300"
                      }`}
                      onClick={() => setSelectedPatient(patient)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-slate-900">{patient.name}</p>
                          <p className="text-sm text-slate-600">{patient.age} years • {patient.gender}</p>
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
                      <Button variant="outline" size="sm">
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Message
                      </Button>
                      <Button size="sm" onClick={exportReport}>
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
    </div>
  );
}
