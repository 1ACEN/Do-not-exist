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
      },
    ],
  };

  const heartDataset = {
    labels,
    datasets: [
      {
        label: "Heart Rate",
        data: filtered.map((d) => d.heartRate),
        backgroundColor: colorMap.heartRate,
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
        backgroundColor: "#10b981",
      },
    ],
  };

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
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Vitals & Analytics</h1>
        <div>
          <label className="block text-sm text-slate-600">Range</label>
          <select className="mt-1" value={String(rangeDays)} onChange={(e) => setRangeDays(e.target.value === "all" ? "all" : Number(e.target.value))}>
            <option value={7}>Last 7 days</option>
            <option value={14}>Last 14 days</option>
            <option value={30}>Last 30 days</option>
            <option value="all">All</option>
          </select>
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
