"use client";

import { useEffect, useState, useCallback } from "react";
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

type AnalyticsData = {
  period: number;
  totalEntries: number;
  averages: {
    sleep: number;
    heartRate: number;
    steps: number;
    water: number;
    mood: number;
    stress: number;
    systolic: number;
    diastolic: number;
  };
  trends: {
    sleep: string;
    heartRate: string;
    steps: string;
    water: string;
    mood: string;
    stress: string;
  };
  insights: Array<{
    type: 'warning' | 'info' | 'success';
    category: string;
    message: string;
    recommendation: string;
  }>;
  charts: {
    daily: Array<{
      date: string;
      sleep: number;
      heartRate: number;
      steps: number;
      water: number;
      mood: number;
      stress: number;
      systolic: number;
      diastolic: number;
    }>;
    weekly: Array<{
      week: string;
      sleep: number;
      heartRate: number;
      steps: number;
      water: number;
      mood: number;
      stress: number;
    }>;
    monthly: Array<{
      month: string;
      sleep: number;
      heartRate: number;
      steps: number;
      water: number;
      mood: number;
      stress: number;
    }>;
  };
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

// Health goals will be calculated from analytics data
const getHealthGoals = (analytics: AnalyticsData | null): HealthGoal[] => {
  if (!analytics) {
    return [
      { id: "steps", title: "Daily Steps", target: 10000, current: 7500, unit: "steps", color: "#10b981" },
      { id: "water", title: "Water Intake", target: 8, current: 6, unit: "glasses", color: "#3b82f6" },
      { id: "sleep", title: "Sleep Hours", target: 8, current: 7, unit: "hours", color: "#8b5cf6" },
      { id: "exercise", title: "Exercise", target: 30, current: 20, unit: "minutes", color: "#f59e0b" },
    ];
  }

  return [
    { 
      id: "steps", 
      title: "Daily Steps", 
      target: 10000, 
      current: Math.round(analytics.averages.steps), 
      unit: "steps", 
      color: "#10b981" 
    },
    { 
      id: "water", 
      title: "Water Intake", 
      target: 8, 
      current: Math.round(analytics.averages.water), 
      unit: "glasses", 
      color: "#3b82f6" 
    },
    { 
      id: "sleep", 
      title: "Sleep Hours", 
      target: 8, 
      current: Math.round(analytics.averages.sleep * 10) / 10, 
      unit: "hours", 
      color: "#8b5cf6" 
    },
    { 
      id: "mood", 
      title: "Mood Score", 
      target: 8, 
      current: Math.round(analytics.averages.mood * 10) / 10, 
      unit: "rating", 
      color: "#f59e0b" 
    },
  ];
};

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
  const [logs, setLogs] = useState<DailyLog[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();
  
  // Use analytics data for latest values, fallback to mock data
  const latest: DailyLog = analytics?.charts.daily[analytics.charts.daily.length - 1] || {
    sleep: 7,
    heartRate: 72,
    systolic: 120,
    diastolic: 80,
    steps: 5000,
    water: 8,
    mood: 5,
    stress: 3,
    weight: 70,
    temperature: 98,
    date: "", // Add missing 'date' property to match DailyLog type
  };

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

  // Fetch analytics data
  const fetchAnalytics = useCallback(async (period = 30) => {
    try {
      const res = await fetch(`/api/analytics?period=${period}`);
      if (res.ok) {
        const data = await res.json();
        setAnalytics(data.analytics);
        
        // Update logs with daily chart data
        if (data.analytics.charts.daily.length > 0) {
          setLogs(data.analytics.charts.daily);
        }
      }
    } catch (error) {
      console.error("Failed to fetch analytics:", error);
    }
  }, []);

  // Refresh data function
  const refreshData = useCallback(async () => {
    setRefreshing(true);
    await fetchAnalytics();
    setRefreshing(false);
  }, [fetchAnalytics]);

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
          
          // Fetch doctor information (and prescriptions/notices)
          try {
            const doctorRes = await fetch("/api/doctor-info");
            const doctorData = await doctorRes.json();
            
            if (doctorRes.ok) {
              setDoctorInfo(doctorData.doctorInfo);
              setPrescriptions(doctorData.prescriptions || []);
              setDoctorNotes(doctorData.doctorNotes || []);
              // Add general notices from doctor
              if (doctorData.notices && Array.isArray(doctorData.notices)) {
                // prepend notices as doctorNotes for display
                const noticesAsNotes = doctorData.notices.map((n: any) => ({ id: n.id, date: n.date, note: n.message, type: 'general' }));
                setDoctorNotes(prev => [...noticesAsNotes, ...(prev || [])]);
              }
            }
          } catch (doctorError) {
            console.error("Failed to fetch doctor info:", doctorError);
            // Keep using mock data if API fails
          }

          // Fetch analytics data
          await fetchAnalytics();
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

  // Poll for doctor-info periodically so assignments and notices appear in near real-time
  useEffect(() => {
    let mounted = true;
    const tick = async () => {
      try {
        const res = await fetch('/api/doctor-info');
        if (!res.ok) return;
        const data = await res.json();
        if (!mounted) return;
        setDoctorInfo(data.doctorInfo);
        setPrescriptions(data.prescriptions || []);
        // merge notices
        if (data.notices) {
          setDoctorNotes(prev => {
            const incoming = data.notices.map((n: any) => ({ id: n.id, date: n.date, note: n.message, type: 'general' }));
            // simple dedupe by id
            const ids = new Set(prev.map(p => p.id));
            return [...incoming.filter((i: any) => !ids.has(i.id)), ...prev];
          });
        }
      } catch (e) { /* ignore */ }
    };
    const id = setInterval(tick, 10000);
    // run immediate
    tick();
    return () => { mounted = false; clearInterval(id); };
  }, []);

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
      // Save vitals data to database
      const vitalsRes = await fetch("/api/vitals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: new Date().toISOString().slice(0, 10),
          sleep: form.sleep,
          heartRate: form.heartRate,
          systolic: form.systolic,
          diastolic: form.diastolic,
          steps: form.steps,
          water: form.water,
          mood: form.mood,
          stress: form.stress,
          notes: form.notes
        }),
      });

      if (vitalsRes.ok) {
        // Get AI prediction
        const res = await fetchPrediction({
          heartRate: form.heartRate,
          bloodPressureSys: form.systolic,
          bloodPressureDia: form.diastolic,
          sleep: form.sleep,
          stress: form.stress,
        });
        setPrediction({ label: res.predictedDisease, accuracy: res.accuracy, risk: res.riskScore });
        
        // Refresh analytics data to get updated charts
        await fetchAnalytics();
        setStreak((s) => s + 1);
      }
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
    <div className="space-y-8 p-6">
      {/* Welcome Header */}
      <div className="flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Welcome back, {user?.name || "User"}!
          </h1>
          <p className="text-slate-600 mt-2">
            Track your health journey and stay on top of your wellness goals.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right bg-white rounded-lg p-4 shadow-sm">
            <div className="text-sm text-slate-600">Current Streak</div>
            <div className="text-2xl font-bold text-emerald-600">{streak} days</div>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={refreshData}
            disabled={refreshing}
            className="flex items-center gap-2 bg-white shadow-sm"
          >
            <TrendingUp className="h-4 w-4" />
            {refreshing ? "Refreshing..." : "Refresh"}
          </Button>
          <Calendar className="h-8 w-8 text-slate-400" />
        </div>
      </div>

      {/* Health Goals Overview */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {getHealthGoals(analytics).map((goal) => (
          <Card key={goal.id} className="relative overflow-hidden rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 mb-2">{goal.title}</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {goal.current} / {goal.target}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">{goal.unit}</p>
                </div>
                <div className="h-12 w-12 rounded-full flex items-center justify-center shadow-sm" style={{ backgroundColor: `${goal.color}20` }}>
                  <Target className="h-6 w-6" style={{ color: goal.color }} />
                </div>
              </div>
              <div className="mt-6">
                <Progress 
                  value={(goal.current / goal.target) * 100} 
                  className="h-3 rounded-full"
                />
                <p className="text-xs text-slate-500 mt-2 font-medium">
                  {Math.round((goal.current / goal.target) * 100)}% complete
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">

          {/* Charts Section */}
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
            <Tabs defaultValue="overview">
              <TabsList className="grid w-full grid-cols-3 bg-slate-100 rounded-lg p-1">
                <TabsTrigger value="overview" className="rounded-md">Overview</TabsTrigger>
                <TabsTrigger value="vitals" className="rounded-md">Vitals</TabsTrigger>
                <TabsTrigger value="trends" className="rounded-md">Trends</TabsTrigger>
              </TabsList>
            
            <TabsContent value="overview" className="grid gap-6 md:grid-cols-2 mt-6">
              <Card className="rounded-xl shadow-md border-0">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-semibold">Weekly Activity</CardTitle>
                </CardHeader>
                <CardContent style={{ height: 300 }} className="pt-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analytics?.charts.weekly || weeklyStats}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="week" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'white', 
                          border: '1px solid #e2e8f0', 
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }} 
                      />
                      <Bar dataKey="steps" fill="#10b981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              
              <Card className="rounded-xl shadow-md border-0">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-semibold">Daily Distribution</CardTitle>
                </CardHeader>
                <CardContent style={{ height: 300 }} className="pt-0">
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
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'white', 
                          border: '1px solid #e2e8f0', 
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }} 
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="vitals" className="grid gap-6 md:grid-cols-2 mt-6">
              <Card className="rounded-xl shadow-md border-0">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-semibold">Heart Rate Trend</CardTitle>
                </CardHeader>
                <CardContent style={{ height: 260 }} className="pt-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={analytics?.charts.daily || logs}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'white', 
                          border: '1px solid #e2e8f0', 
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }} 
                      />
                      <Line type="monotone" dataKey="heartRate" stroke="#b91c1c" strokeWidth={3} dot={{ fill: '#b91c1c', strokeWidth: 2, r: 4 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              
              <Card className="rounded-xl shadow-md border-0">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-semibold">Sleep Hours Trend</CardTitle>
                </CardHeader>
                <CardContent style={{ height: 260 }} className="pt-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={analytics?.charts.daily || logs}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'white', 
                          border: '1px solid #e2e8f0', 
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }} 
                      />
                      <Line type="monotone" dataKey="sleep" stroke="#8b5cf6" strokeWidth={3} dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 4 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="trends" className="grid gap-6 md:grid-cols-2 mt-6">
              <Card className="rounded-xl shadow-md border-0">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-semibold">Wellness Radar</CardTitle>
                </CardHeader>
                <CardContent style={{ height: 260 }} className="pt-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={moodRadar}>
                      <PolarGrid stroke="#f1f5f9" />
                      <PolarAngleAxis dataKey="metric" tick={{ fontSize: 12 }} />
                      <PolarRadiusAxis angle={30} domain={[0, 5]} tick={{ fontSize: 12 }} />
                      <Radar dataKey="value" stroke="#b91c1c" fill="#b91c1c" fillOpacity={0.3} strokeWidth={2} />
                    </RadarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              
              <Card className="rounded-xl shadow-md border-0">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-semibold">Steps Trend</CardTitle>
                </CardHeader>
                <CardContent style={{ height: 260 }} className="pt-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={analytics?.charts.daily || logs}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'white', 
                          border: '1px solid #e2e8f0', 
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }} 
                      />
                      <Line type="monotone" dataKey="steps" stroke="#10b981" strokeWidth={3} dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">

          Health Insights
          {/* <Card className="rounded-xl shadow-lg border-0">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                <AlertTriangle className="h-5 w-5 text-amber-600" />
                Health Insights
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-4">
                {analytics?.insights.length > 0 ? (
                  analytics.insights.map((insight, index) => (
                    <div 
                      key={index}
                      className={`rounded-lg border p-4 text-sm shadow-sm ${
                        insight.type === 'warning' 
                          ? 'border-amber-200 bg-amber-50 text-amber-800'
                          : insight.type === 'success'
                          ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                          : 'border-blue-200 bg-blue-50 text-blue-800'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        {insight.type === 'warning' ? (
                          <AlertTriangle className="h-4 w-4" />
                        ) : insight.type === 'success' ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : (
                          <TrendingUp className="h-4 w-4" />
                        )}
                        <span className="font-medium">{insight.category}</span>
                      </div>
                      <p className="mb-2">{insight.message}</p>
                      <p className="text-xs italic opacity-80">{insight.recommendation}</p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-slate-500 bg-slate-50 rounded-lg">
                    <CheckCircle className="h-12 w-12 mx-auto mb-3 text-green-600" />
                    <p className="text-sm font-medium">No alerts at this time</p>
                    <p className="text-xs mt-1">Keep logging your health data for personalized insights</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card> */}

          {/* Doctor Section */}
          <Card className="rounded-xl shadow-lg border-0">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                <Stethoscope className="h-5 w-5 text-blue-600" />
                Doctor
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              {doctorInfo ? (
                <div className="space-y-6">
                  {/* Doctor Info */}
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg shadow-sm">
                    <div className="flex items-center gap-2 mb-3">
                      <Stethoscope className="h-4 w-4 text-blue-600" />
                      <span className="font-medium text-blue-900">{doctorInfo.name}</span>
                    </div>
                    <p className="text-sm text-blue-700 mb-2">{doctorInfo.specialization}</p>
                    <p className="text-xs text-blue-600 mb-1">Assigned: {new Date(doctorInfo.assignedDate).toLocaleDateString()}</p>
                    <p className="text-xs text-blue-600">Contact: {doctorInfo.contact}</p>
                  </div>

                  {/* Prescriptions */}
                  {prescriptions.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-slate-900 mb-3 flex items-center gap-2">
                        <Pill className="h-4 w-4 text-green-600" />
                        Current Prescriptions
                      </h4>
                      <div className="space-y-3">
                        {prescriptions.map((prescription) => (
                          <div key={prescription.id} className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm shadow-sm">
                            <div className="font-medium text-green-900 mb-1">{prescription.medication}</div>
                            <div className="text-green-700 mb-2">
                              {prescription.dosage} - {prescription.frequency} for {prescription.duration}
                            </div>
                            <div className="text-xs text-green-600 mb-1">
                              Prescribed: {new Date(prescription.prescribedDate).toLocaleDateString()}
                            </div>
                            {prescription.notes && (
                              <div className="text-xs text-green-600 italic">{prescription.notes}</div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Doctor Notes */}
                  {doctorNotes.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-slate-900 mb-3 flex items-center gap-2">
                        <MessageSquare className="h-4 w-4 text-purple-600" />
                        Doctor Notes
                      </h4>
                      <div className="space-y-3">
                        {doctorNotes.map((note) => (
                          <div key={note.id} className="p-3 bg-purple-50 border border-purple-200 rounded-lg text-sm shadow-sm">
                            <div className="flex items-center justify-between mb-2">
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
                <div className="text-center py-8 bg-slate-50 rounded-lg">
                  <UserX className="h-12 w-12 mx-auto mb-3 text-slate-400" />
                  <p className="text-slate-600 text-sm font-medium">No doctor assigned</p>
                  <p className="text-xs text-slate-500 mt-1">Contact support to get assigned to a doctor</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card className="rounded-xl shadow-lg border-0">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold">Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-4">
                {analytics ? (
                  <>
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <span className="text-sm text-slate-600">Avg Heart Rate</span>
                      <span className="font-semibold text-slate-900">{Math.round(analytics.averages.heartRate)} bpm</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <span className="text-sm text-slate-600">Avg Sleep</span>
                      <span className="font-semibold text-slate-900">{Math.round(analytics.averages.sleep * 10) / 10} hrs</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <span className="text-sm text-slate-600">Avg Steps</span>
                      <span className="font-semibold text-slate-900">{Math.round(analytics.averages.steps).toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <span className="text-sm text-slate-600">Avg Mood</span>
                      <span className="font-semibold text-slate-900">{Math.round(analytics.averages.mood * 10) / 10}/5</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <span className="text-sm text-slate-600">Total Entries</span>
                      <span className="font-semibold text-slate-900">{analytics.totalEntries}</span>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8 text-slate-500 bg-slate-50 rounded-lg">
                    <p className="text-sm font-medium">No data available</p>
                    <p className="text-xs mt-1">Start logging your health data</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
