"use client";

import React, { useEffect, useState } from "react";
import { Line, Bar, Bubble, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  RadialLinearScale,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  RadialLinearScale
);

type Vital = {
  date: string;
  sleep: number;
  heartRate: number;
  steps: number;
  water: number;
  diet: string;
  mood: number;
  stress: number;
  notes?: string;
};

export default function AnalyticsCharts({ userId, initialRange = 7 }: { userId?: string; initialRange?: number | "all" }) {
  const [data, setData] = useState<Vital[]>([]);
  const [anomalies, setAnomalies] = useState<any[]>([]);
  const [showAlerts, setShowAlerts] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rangeDays, setRangeDays] = useState<number | "all">(initialRange);

  useEffect(() => {
    let mounted = true;
    const url = userId ? `/api/vitals/${userId}` : "/api/vitals";
    fetch(url)
      .then((r) => r.json())
      .then((json) => {
        if (!mounted) return;
        const items = json?.items ?? [];
        const mapped: Vital[] = items.map((it: any) => {
          const d = it?.date ? new Date(it.date) : new Date();
          const date = d.toISOString().slice(0, 10);
          return {
            // include rawId so we can match anomalies returned from server
            // @ts-ignore
            rawId: it._id ?? it.id ?? undefined,
            date,
            sleep: Number(it.sleep || 0),
            heartRate: Number(it.heartRate || 0),
            steps: Number(it.steps || 0),
            water: Number(it.water || 0),
            diet: String(it.diet || ""),
            mood: Number(it.mood || 0),
            stress: Number(it.stress || 0),
            notes: it.notes ? String(it.notes) : undefined,
          } as Vital;
        });
        setData(mapped.reverse());
        // capture anomalies if the API returned them
        setAnomalies(json?.anomalies ?? []);
      })
      .catch((e) => {
        console.error(e);
        if (mounted) setError("Failed to load analytics");
      })
      .finally(() => mounted && setLoading(false));

    return () => {
      mounted = false;
    };
  }, [userId]);

  if (loading) return <div className="p-4">Loading analytics...</div>;
  if (error) return <div className="p-4 text-red-600">{error}</div>;

  const filtered = data.filter((d) => {
    if (rangeDays !== "all") {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - (rangeDays as number) + 1);
      if (new Date(d.date) < cutoff) return false;
    }
    return true;
  });

  const labels = filtered.map((d) => d.date);

  const colorMap: Record<string, string> = {
    sleep: "#111827",
    water: "#3b82f6",
    steps: "#10b981",
    heartRate: "#ef4444",
    mood: "#f59e0b",
    stress: "#8b5cf6",
  };

  const sleepDataset = {
    labels,
    datasets: [
      {
        label: "Sleep (hrs)",
        data: filtered.map((d) => d.sleep),
        borderColor: colorMap.sleep,
        backgroundColor: colorMap.sleep + "33",
        tension: 0.2,
        fill: true,
        pointBackgroundColor: filtered.map((d) =>
          anomalies.some((a) => a.metric === "sleep" && String(a.itemId) === String((d as any).rawId ?? d.date)) ? "#ef4444" : colorMap.sleep
        ),
        pointRadius: filtered.map((d) =>
          anomalies.some((a) => a.metric === "sleep" && String(a.itemId) === String((d as any).rawId ?? d.date)) ? 6 : 3
        ),
      },
    ],
  };

  const waterDataset = {
    labels,
    datasets: [
      {
        label: "Water (glasses)",
        data: filtered.map((d) => d.water),
        borderColor: colorMap.water,
        backgroundColor: colorMap.water + "33",
        tension: 0.2,
        fill: true,
        pointBackgroundColor: filtered.map((d) =>
          anomalies.some((a) => a.metric === "water" && String(a.itemId) === String((d as any).rawId ?? d.date)) ? "#ef4444" : colorMap.water
        ),
        pointRadius: filtered.map((d) =>
          anomalies.some((a) => a.metric === "water" && String(a.itemId) === String((d as any).rawId ?? d.date)) ? 6 : 3
        ),
      },
    ],
  };

  const heartDataset = {
    labels,
    datasets: [
      {
        label: "Heart Rate",
        data: filtered.map((d) => d.heartRate),
        backgroundColor: filtered.map((d) =>
          anomalies.some((a) => a.metric === "heartRate" && String(a.itemId) === String((d as any).rawId ?? d.date)) ? "#ef4444" : colorMap.heartRate
        ),
        borderColor: colorMap.heartRate,
        borderWidth: 1,
      },
    ],
  };

  const stepsDataset = {
    labels,
    datasets: [
      {
        label: "Steps",
        data: filtered.map((d) => d.steps),
        backgroundColor: filtered.map((d) =>
          anomalies.some((a) => a.metric === "steps" && String(a.itemId) === String((d as any).rawId ?? d.date)) ? "#ef4444" : "#10b981"
        ),
      },
    ],
  };

  // Prepare a list of friendly alerts from anomalies
  const alerts = anomalies.map((a: any) => ({ id: a.itemId, metric: a.metric, value: a.value, reason: a.reason }));

  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "top" as const },
    },
    scales: {
      x: { grid: { display: false } },
    },
  } as any;

  const avg = (arr: number[]) => (arr.length ? +(arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(1) : 0);
  const avgSleep = avg(filtered.map((d) => d.sleep));
  const avgSteps = Math.round(avg(filtered.map((d) => d.steps)));
  const avgWater = avg(filtered.map((d) => d.water));
  const avgMood = avg(filtered.map((d) => d.mood));
  const avgStress = avg(filtered.map((d) => d.stress));

  const dietCounts = filtered.reduce<Record<string, number>>((acc, d) => {
    const k = d.diet || "Unknown";
    acc[k] = (acc[k] || 0) + 1;
    return acc;
  }, {});
  const dietLabels = Object.keys(dietCounts);
  const dietData = dietLabels.map((l) => dietCounts[l]);

  const moodBubbleData = {
    datasets: [
      {
        label: "Mood vs Stress",
        data: filtered.map((d, idx) => ({ x: d.mood || 0, y: d.stress || 0, r: Math.max(4, Math.round((d.steps || 0) / 1000)) })),
        backgroundColor: "rgba(219,39,119,0.6)",
        borderColor: "rgba(219,39,119,1)",
      },
    ],
  };

  const dietDoughnut = {
    labels: dietLabels,
    datasets: [
      {
        data: dietData,
        backgroundColor: ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#9ca3af"].slice(0, dietLabels.length),
      },
    ],
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start md:items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">Vitals & Analytics</h1>
        <div className="ml-auto flex items-center gap-3">
          <div>
            <label className="block text-sm text-slate-600">Range</label>
            <select className="mt-1" value={String(rangeDays)} onChange={(e) => setRangeDays(e.target.value === "all" ? "all" : Number(e.target.value))}>
              <option value={7}>Last 7 days</option>
              <option value={14}>Last 14 days</option>
              <option value={30}>Last 30 days</option>
              <option value="all">All</option>
            </select>
          </div>
          <div className="relative">
            <button
              aria-label="Show deviation alerts"
              className="relative inline-flex items-center rounded-md px-3 py-2 bg-white border border-slate-200 shadow-sm hover:bg-rose-50"
              onClick={() => setShowAlerts((s) => !s)}
            >
              {/* bell icon */}
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-rose-600" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h11z" />
                <path strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" d="M13.73 21a2 2 0 01-3.46 0" />
              </svg>
              {alerts.length > 0 && (
                <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-semibold leading-none text-white bg-rose-600 rounded-full">{alerts.length}</span>
              )}
            </button>

            {/* popover */}
            {showAlerts && (
              <div className="absolute right-0 mt-2 w-72 bg-white border border-slate-200 rounded-md shadow-lg z-30">
                <div className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-semibold">Deviation Alerts</div>
                    <button className="text-xs text-slate-500" onClick={() => setShowAlerts(false)}>Close</button>
                  </div>
                  <div className="mt-2 max-h-64 overflow-auto">
                    {alerts.length === 0 ? (
                      <div className="text-sm text-slate-500">No alerts</div>
                    ) : (
                      <ul className="space-y-2">
                        {alerts.map((a) => (
                          <li key={`${a.id}-${a.metric}`} className="flex items-start gap-3">
                            <div className="mt-0.5 h-3 w-3 rounded-full bg-rose-600" />
                            <div>
                              <div className="text-sm font-medium text-slate-900">{a.metric}</div>
                              <div className="text-xs text-slate-600">{String(a.value)} — {a.reason}</div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-slate-600">Avg Sleep</div>
          <div className="text-2xl font-semibold">{avgSleep} hrs</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-slate-600">Avg Steps</div>
          <div className="text-2xl font-semibold">{avgSteps}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-slate-600">Avg Water</div>
          <div className="text-2xl font-semibold">{avgWater} glasses</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-slate-600">Mood / Stress</div>
          <div className="text-2xl font-semibold">{avgMood.toFixed(1)} / {avgStress.toFixed(1)}</div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-sm text-slate-600 mb-2">Mood vs Stress</h3>
          <div style={{ height: 260 }}>
            <Bubble data={moodBubbleData} options={{ responsive: true, maintainAspectRatio: false, scales: { x: { title: { display: true, text: 'Mood' } }, y: { title: { display: true, text: 'Stress' } } } }} />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-sm text-slate-600 mb-2">Diet Distribution</h3>
          <div style={{ height: 220 }}>
            <Pie data={dietDoughnut} options={{ responsive: true, maintainAspectRatio: false }} />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        <h2 className="text-lg font-bold mb-3">Vitals</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <section className="p-2">
            <h3 className="text-sm text-slate-600 mb-2 font-semibold">Sleep (last {filtered.length} days)</h3>
            <div style={{ height: 220 }}>
              <Line data={sleepDataset} options={commonOptions} />
            </div>
          </section>

          <section className="p-2">
            <h3 className="text-sm text-slate-600 mb-2 font-semibold">Water (last {filtered.length} days)</h3>
            <div style={{ height: 220 }}>
              <Line data={waterDataset} options={commonOptions} />
            </div>
          </section>

          <section className="p-2">
            <h3 className="text-sm text-slate-600 mb-2 font-semibold">Heart Rate (last {filtered.length} days)</h3>
            <div style={{ height: 220 }}>
              <Bar data={heartDataset} options={commonOptions} />
            </div>
          </section>
        </div>
      </div>

      <section className="bg-white rounded-lg shadow p-4">
        <h2 className="text-lg font-medium mb-2">Steps (last {filtered.length} days)</h2>
        <div style={{ height: 260 }}>
          <Bar data={stepsDataset} options={commonOptions} />
        </div>
      </section>
    </div>
  );
}
