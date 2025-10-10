"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { fetchPrediction } from "@/lib/api";
import { 
  Activity, 
  Droplet, 
  Footprints, 
  Heart, 
  Smile, 
  Timer, 
  Calendar,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Target,
  BarChart3,
  Shield,
  Loader2,
  Stethoscope,
  FileText,
  Pill,
  MessageSquare,
  UserX
} from "lucide-react";
import { 
  LineChart, 
  Line, 
  CartesianGrid, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from "recharts";

type DailyLog = {
  date: string;
  sleep: number;
  heartRate: number;
  systolic: number;
  diastolic: number;
  steps: number;
  water: number;
  mood: number;
  stress: number;
  weight?: number;
  temperature?: number;
};

type HealthGoal = {
  id: string;
  title: string;
  target: number;
  current: number;
  unit: string;
  color: string;
};

type DoctorInfo = {
  id: string;
  name: string;
  specialization: string;
  contact: string;
  assignedDate: string;
};

type Prescription = {
  id: string;
  medication: string;
  dosage: string;
  frequency: string;
  duration: string;
  prescribedDate: string;
  notes?: string;
};

type DoctorNote = {
  id: string;
  date: string;
  note: string;
  type: "general" | "follow-up" | "urgent";
};

const initialData: DailyLog[] = Array.from({ length: 14 }).map((_, i) => {
  const d = new Date();
  d.setDate(d.getDate() - (13 - i));
  return {
    date: d.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
    sleep: Math.round(6 + Math.random() * 3),
    heartRate: Math.round(65 + Math.random() * 20),
    systolic: Math.round(112 + Math.random() * 15),
    diastolic: Math.round(72 + Math.random() * 10),
    steps: Math.round(5000 + Math.random() * 6000),
    water: Math.round(6 + Math.random() * 4),
    mood: Math.round(5 + Math.random() * 5),
    stress: Math.round(2 + Math.random() * 6),
    weight: Math.round(70 + Math.random() * 5),
    temperature: Math.round(98 + Math.random() * 2),
  } as DailyLog;
});

const healthGoals: HealthGoal[] = [
  { id: "steps", title: "Daily Steps", target: 10000, current: 7500, unit: "steps", color: "#10b981" },
  { id: "water", title: "Water Intake", target: 8, current: 6, unit: "glasses", color: "#3b82f6" },
  { id: "sleep", title: "Sleep Hours", target: 8, current: 7, unit: "hours", color: "#8b5cf6" },
  { id: "exercise", title: "Exercise", target: 30, current: 20, unit: "minutes", color: "#f59e0b" },
];

// Mock doctor data - set to null to simulate no doctor assigned
// Uncomment the lines below to see how it looks with a doctor assigned
const mockDoctorInfo: DoctorInfo | null = {
  id: "doc1",
  name: "Dr. Sarah Johnson",
  specialization: "Cardiologist",
  contact: "sarah.johnson@healthcare.com",
  assignedDate: "2024-01-10"
};

const mockPrescriptions: Prescription[] = [
  {
    id: "pres1",
    medication: "Metformin",
    dosage: "500mg",
    frequency: "Twice daily",
    duration: "30 days",
    prescribedDate: "2024-01-15",
    notes: "Take with food to reduce stomach upset"
  },
  {
    id: "pres2",
    medication: "Lisinopril",
    dosage: "10mg",
    frequency: "Once daily",
    duration: "60 days",
    prescribedDate: "2024-01-15"
  }
];

const mockDoctorNotes: DoctorNote[] = [
  {
    id: "note1",
    date: "2024-01-15",
    note: "Patient shows improvement in blood pressure readings. Continue current medication regimen.",
    type: "follow-up"
  },
  {
    id: "note2",
    date: "2024-01-20",
    note: "Schedule follow-up appointment in 2 weeks to monitor progress.",
    type: "general"
  }
];

export default function UserDashboard() {
  const [logs, setLogs] = useState<DailyLog[]>(initialData);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);
  const router = useRouter();
  const latest = logs[logs.length - 1];

  const [form, setForm] = useState({
    sleep: latest.sleep,
    heartRate: latest.heartRate,
    systolic: latest.systolic,
    diastolic: latest.diastolic,
    steps: latest.steps,
    water: latest.water,
    mood: latest.mood,
    stress: latest.stress,
    weight: latest.weight || 70,
    temperature: latest.temperature || 98,
    notes: "",
  });

  const [prediction, setPrediction] = useState<{ label: string; accuracy: number; risk: number } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [streak, setStreak] = useState(12);
  const [doctorInfo, setDoctorInfo] = useState<DoctorInfo | null>(mockDoctorInfo);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>(mockPrescriptions);
  const [doctorNotes, setDoctorNotes] = useState<DoctorNote[]>(mockDoctorNotes);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/me");
        const data = await res.json();
        
        if (data.user) {
          // Check if user has access to this dashboard
          if (data.user.role !== "client") {
            setAccessDenied(true);
            setLoading(false);
            return;
          }
          setUser(data.user);
          
          // Fetch doctor information
          try {
            const doctorRes = await fetch("/api/doctor-info");
            const doctorData = await doctorRes.json();
            
            if (doctorRes.ok) {
              setDoctorInfo(doctorData.doctorInfo);
              setPrescriptions(doctorData.prescriptions);
              setDoctorNotes(doctorData.doctorNotes);
            }
          } catch (doctorError) {
            console.error("Failed to fetch doctor info:", doctorError);
            // Keep using mock data if API fails
          }
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
              This dashboard is only accessible to patients/users. Please contact your administrator if you believe this is an error.
            </p>
            <Button onClick={() => router.push("/dashboard")}>
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  async function onSubmit() {
    setSubmitting(true);
    try {
      const res = await fetchPrediction({
        heartRate: form.heartRate,
        bloodPressureSys: form.systolic,
        bloodPressureDia: form.diastolic,
        sleep: form.sleep,
        stress: form.stress,
      });
      setPrediction({ label: res.predictedDisease, accuracy: res.accuracy, risk: res.riskScore });
      
      const today = new Date();
      const next: DailyLog = {
        date: today.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
        sleep: form.sleep,
        heartRate: form.heartRate,
        systolic: form.systolic,
        diastolic: form.diastolic,
        steps: form.steps,
        water: form.water,
        mood: form.mood,
        stress: form.stress,
        weight: form.weight,
        temperature: form.temperature,
      };
      setLogs((prev) => [...prev.slice(-13), next]);
      setStreak((s) => s + 1);
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  }

  const moodRadar = [
    { metric: "Mood", value: form.mood },
    { metric: "Stress", value: form.stress },
    { metric: "Sleep", value: Math.min(10, Math.round((form.sleep / 8) * 10)) },
    { metric: "Activity", value: Math.min(10, Math.round((form.steps / 10000) * 10)) },
  ];

  const weeklyStats = [
    { name: "Mon", steps: 8500, sleep: 7.5, mood: 7 },
    { name: "Tue", steps: 9200, sleep: 8, mood: 8 },
    { name: "Wed", steps: 7800, sleep: 6.5, mood: 6 },
    { name: "Thu", steps: 10500, sleep: 7, mood: 7 },
    { name: "Fri", steps: 8800, sleep: 8.5, mood: 8 },
    { name: "Sat", steps: 12000, sleep: 9, mood: 9 },
    { name: "Sun", steps: 6500, sleep: 8, mood: 7 },
  ];

  const pieData = [
    { name: "Sleep", value: form.sleep, color: "#8b5cf6" },
    { name: "Exercise", value: 2, color: "#f59e0b" },
    { name: "Work", value: 8, color: "#ef4444" },
    { name: "Leisure", value: 4, color: "#10b981" },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Welcome back, {user?.name || "User"}!
          </h1>
          <p className="text-slate-600 mt-1">
            Track your health journey and stay on top of your wellness goals.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-sm text-slate-600">Current Streak</div>
            <div className="text-2xl font-bold text-emerald-600">{streak} days</div>
          </div>
          <Calendar className="h-8 w-8 text-slate-400" />
        </div>
      </div>

      {/* Health Goals Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {healthGoals.map((goal) => (
          <Card key={goal.id} className="relative overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">{goal.title}</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {goal.current} / {goal.target}
                  </p>
                  <p className="text-xs text-slate-500">{goal.unit}</p>
                </div>
                <div className="h-12 w-12 rounded-full flex items-center justify-center" style={{ backgroundColor: `${goal.color}20` }}>
                  <Target className="h-6 w-6" style={{ color: goal.color }} />
                </div>
              </div>
              <div className="mt-4">
                <Progress 
                  value={(goal.current / goal.target) * 100} 
                  className="h-2"
                />
                <p className="text-xs text-slate-500 mt-1">
                  {Math.round((goal.current / goal.target) * 100)}% complete
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Daily Log Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-emerald-600" />
                Today's Health Log
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label>Sleep Duration (hrs)</Label>
                  <div className="mt-2 flex items-center gap-3">
                    <Timer className="h-4 w-4 text-sky-600" />
                    <Input 
                      type="number" 
                      value={form.sleep} 
                      onChange={(e) => setForm({ ...form, sleep: Number(e.target.value) })} 
                    />
                  </div>
                </div>
                <div>
                  <Label>Heart Rate (bpm)</Label>
                  <div className="mt-2 flex items-center gap-3">
                    <Heart className="h-4 w-4 text-rose-600" />
                    <Input 
                      type="number" 
                      value={form.heartRate} 
                      onChange={(e) => setForm({ ...form, heartRate: Number(e.target.value) })} 
                    />
                  </div>
                </div>
                <div>
                  <Label>Blood Pressure (sys/dia)</Label>
                  <div className="mt-2 grid grid-cols-2 gap-3">
                    <Input 
                      placeholder="Systolic" 
                      type="number" 
                      value={form.systolic} 
                      onChange={(e) => setForm({ ...form, systolic: Number(e.target.value) })} 
                    />
                    <Input 
                      placeholder="Diastolic" 
                      type="number" 
                      value={form.diastolic} 
                      onChange={(e) => setForm({ ...form, diastolic: Number(e.target.value) })} 
                    />
                  </div>
                </div>
                <div>
                  <Label>Step Count</Label>
                  <div className="mt-2 flex items-center gap-3">
                    <Footprints className="h-4 w-4 text-emerald-600" />
                    <Input 
                      type="number" 
                      value={form.steps} 
                      onChange={(e) => setForm({ ...form, steps: Number(e.target.value) })} 
                    />
                  </div>
                </div>
                <div>
                  <Label>Water Intake (glasses)</Label>
                  <div className="mt-2 flex items-center gap-3">
                    <Droplet className="h-4 w-4 text-sky-600" />
                    <Input 
                      type="number" 
                      value={form.water} 
                      onChange={(e) => setForm({ ...form, water: Number(e.target.value) })} 
                    />
                  </div>
                </div>
                <div>
                  <Label>Weight (kg)</Label>
                  <Input 
                    type="number" 
                    value={form.weight} 
                    onChange={(e) => setForm({ ...form, weight: Number(e.target.value) })} 
                  />
                </div>
                <div className="sm:col-span-2">
                  <Label>Mood & Stress</Label>
                  <div className="mt-2 grid gap-4">
                    <div className="flex items-center justify-between text-sm text-slate-600">
                      <span className="flex items-center gap-2">
                        <Smile className="h-4 w-4"/>
                        Mood
                      </span>
                      <span>{form.mood}/10</span>
                    </div>
                    <Slider 
                      max={10} 
                      value={[form.mood]} 
                      onValueChange={(v) => setForm({ ...form, mood: v[0] ?? 5 })} 
                    />
                    <div className="flex items-center justify-between text-sm text-slate-600">
                      <span className="flex items-center gap-2">
                        <Activity className="h-4 w-4"/>
                        Stress
                      </span>
                      <span>{form.stress}/10</span>
                    </div>
                    <Slider 
                      max={10} 
                      value={[form.stress]} 
                      onValueChange={(v) => setForm({ ...form, stress: v[0] ?? 5 })} 
                    />
                  </div>
                </div>
              </div>
              <div className="mt-6 flex items-center gap-3">
                <Button onClick={onSubmit} disabled={submitting}>
                  {submitting ? "Submitting..." : "Submit Log"}
                </Button>
                <div className="text-sm text-slate-600">
                  Streak: <span className="font-semibold">{streak} days</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Charts Section */}
          <Tabs defaultValue="overview">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="vitals">Vitals</TabsTrigger>
              <TabsTrigger value="trends">Trends</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Weekly Activity</CardTitle>
                </CardHeader>
                <CardContent style={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={weeklyStats}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="steps" fill="#10b981" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Daily Distribution</CardTitle>
                </CardHeader>
                <CardContent style={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="vitals" className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Heart Rate (14 days)</CardTitle>
                </CardHeader>
                <CardContent style={{ height: 260 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={logs}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="heartRate" stroke="#b91c1c" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Sleep Hours</CardTitle>
                </CardHeader>
                <CardContent style={{ height: 260 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={logs}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="sleep" stroke="#8b5cf6" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="trends" className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Wellness Radar</CardTitle>
                </CardHeader>
                <CardContent style={{ height: 260 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={moodRadar}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="metric" />
                      <PolarRadiusAxis angle={30} domain={[0, 10]} />
                      <Radar dataKey="value" stroke="#b91c1c" fill="#b91c1c" fillOpacity={0.5} />
                    </RadarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Steps Trend</CardTitle>
                </CardHeader>
                <CardContent style={{ height: 260 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={logs}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="steps" stroke="#10b981" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* AI Prediction */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-purple-600" />
                AI Health Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="text-sm text-slate-600">Predicted Risk</div>
                <div className="text-lg font-semibold">
                  {prediction?.label ?? "No prediction yet"}
                </div>
                <div className="text-sm text-slate-600 mt-4">Confidence</div>
                <Progress value={prediction?.accuracy ?? 0} />
                <div className="text-right text-sm text-slate-500">
                  {prediction?.accuracy ? `${prediction.accuracy}%` : "Submit data to analyze"}
                </div>
                <div className="mt-4 rounded-md bg-blue-50 p-3 text-sm text-slate-700 border border-blue-100">
                  {prediction ? (
                    <span>
                      Recommendation: Maintain consistent sleep patterns and consider stress management techniques.
                    </span>
                  ) : (
                    <span>Submit your daily log to receive personalized health insights.</span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Alerts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-600" />
                Health Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    <span className="font-medium">Sleep Alert</span>
                  </div>
                  <p className="mt-1">Your sleep duration has been below 7 hours for 3 consecutive days.</p>
                </div>
                
                <div className="rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    <span className="font-medium">Great Progress!</span>
                  </div>
                  <p className="mt-1">You've maintained your step goal for 5 days straight.</p>
                </div>
                
                <div className="rounded-md border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    <span className="font-medium">Improvement</span>
                  </div>
                  <p className="mt-1">Your stress levels have decreased by 20% this week.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Doctor Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Stethoscope className="h-5 w-5 text-blue-600" />
                Doctor
              </CardTitle>
            </CardHeader>
            <CardContent>
              {doctorInfo ? (
                <div className="space-y-4">
                  {/* Doctor Info */}
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Stethoscope className="h-4 w-4 text-blue-600" />
                      <span className="font-medium text-blue-900">{doctorInfo.name}</span>
                    </div>
                    <p className="text-sm text-blue-700">{doctorInfo.specialization}</p>
                    <p className="text-xs text-blue-600 mt-1">Assigned: {new Date(doctorInfo.assignedDate).toLocaleDateString()}</p>
                    <p className="text-xs text-blue-600">Contact: {doctorInfo.contact}</p>
                  </div>

                  {/* Prescriptions */}
                  {prescriptions.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-slate-900 mb-2 flex items-center gap-2">
                        <Pill className="h-4 w-4 text-green-600" />
                        Current Prescriptions
                      </h4>
                      <div className="space-y-2">
                        {prescriptions.map((prescription) => (
                          <div key={prescription.id} className="p-2 bg-green-50 border border-green-200 rounded text-sm">
                            <div className="font-medium text-green-900">{prescription.medication}</div>
                            <div className="text-green-700">
                              {prescription.dosage} - {prescription.frequency} for {prescription.duration}
                            </div>
                            <div className="text-xs text-green-600 mt-1">
                              Prescribed: {new Date(prescription.prescribedDate).toLocaleDateString()}
                            </div>
                            {prescription.notes && (
                              <div className="text-xs text-green-600 mt-1 italic">{prescription.notes}</div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Doctor Notes */}
                  {doctorNotes.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-slate-900 mb-2 flex items-center gap-2">
                        <MessageSquare className="h-4 w-4 text-purple-600" />
                        Doctor Notes
                      </h4>
                      <div className="space-y-2">
                        {doctorNotes.map((note) => (
                          <div key={note.id} className="p-2 bg-purple-50 border border-purple-200 rounded text-sm">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs text-purple-600">{new Date(note.date).toLocaleDateString()}</span>
                              <span className={`text-xs px-2 py-1 rounded ${
                                note.type === "urgent" ? "bg-red-100 text-red-700" :
                                note.type === "follow-up" ? "bg-blue-100 text-blue-700" :
                                "bg-gray-100 text-gray-700"
                              }`}>
                                {note.type}
                              </span>
                            </div>
                            <p className="text-purple-900">{note.note}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-4">
                  <UserX className="h-8 w-8 mx-auto mb-2 text-slate-400" />
                  <p className="text-slate-600 text-sm">No doctor assigned</p>
                  <p className="text-xs text-slate-500 mt-1">Contact support to get assigned to a doctor</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Avg Heart Rate</span>
                  <span className="font-semibold">{Math.round(logs.reduce((acc, log) => acc + log.heartRate, 0) / logs.length)} bpm</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Avg Sleep</span>
                  <span className="font-semibold">{Math.round(logs.reduce((acc, log) => acc + log.sleep, 0) / logs.length)} hrs</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Avg Steps</span>
                  <span className="font-semibold">{Math.round(logs.reduce((acc, log) => acc + log.steps, 0) / logs.length).toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Avg Mood</span>
                  <span className="font-semibold">{Math.round(logs.reduce((acc, log) => acc + log.mood, 0) / logs.length)}/10</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
