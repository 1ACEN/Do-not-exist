"use client";

import React, { useEffect, useState } from "react";
import { Line, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
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

export default function AnalyticsPage() {
  const [data, setData] = useState<Vital[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rangeDays, setRangeDays] = useState<number | "all">(7);
  const [metric, setMetric] = useState<"sleep" | "water">("water");

  useEffect(() => {
    let mounted = true;
    fetch("/api/vitals")
      .then((r) => r.json())
      .then((json) => {
        if (!mounted) return;
        // vitals route returns { items: [...] }
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
        setData(mapped);
      })
      .catch((e) => {
        console.error(e);
        if (mounted) setError("Failed to load analytics");
      })
      .finally(() => mounted && setLoading(false));

    return () => {
      mounted = false;
    };
  }, []);

  if (loading) return <div className="p-4">Loading analytics...</div>;
  if (error) return <div className="p-4 text-red-600">{error}</div>;

  // apply filters
  const filtered = data.filter((d, i) => {
    if (rangeDays !== "all") {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - (rangeDays as number) + 1);
      if (new Date(d.date) < cutoff) return false;
    }
    // no explicit start/end filters — rangeDays controls the window
    return true;
  });

  const labels = filtered.map((d) => d.date);

  const metricDataset = {
    labels,
    datasets: [
      {
        label: metric === "water" ? "Water (glasses)" : "Sleep (hrs)",
        data: filtered.map((d) => (metric === "water" ? d.water : d.sleep)),
        borderColor: metric === "water" ? "#3b82f6" : "#111111",
        backgroundColor: metric === "water" ? "rgba(59,130,246,0.2)" : "rgba(0,0,0,0.05)",
        tension: 0.3,
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
    plugins: {
      legend: { position: "top" as const },
    },
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Analytics</h1>

      <div className="flex gap-4 items-end">
        <div>
          <label className="block text-sm text-slate-600">Range</label>
          <select className="mt-1" value={String(rangeDays)} onChange={(e) => setRangeDays(e.target.value === "all" ? "all" : Number(e.target.value))}>
            <option value={7}>Last 7 days</option>
            <option value={14}>Last 14 days</option>
            <option value={30}>Last 30 days</option>
            <option value="all">All</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button
            className={`px-3 py-1 rounded ${metric === "water" ? "bg-sky-600 text-white" : "bg-slate-100"}`}
            onClick={() => setMetric("water")}
          >
            Water
          </button>
          <button
            className={`px-3 py-1 rounded ${metric === "sleep" ? "bg-sky-600 text-white" : "bg-slate-100"}`}
            onClick={() => setMetric("sleep")}
          >
            Sleep
          </button>
        </div>
      </div>

      <section className="bg-white rounded-lg shadow p-4">
        <h2 className="text-lg font-medium mb-2">{metric === "water" ? "Water" : "Sleep"} (last {filtered.length} days)</h2>
        <Line data={metricDataset} options={commonOptions} />
      </section>

      <section className="bg-white rounded-lg shadow p-4">
  <h2 className="text-lg font-medium mb-2">Steps (last {filtered.length} days)</h2>
        <Bar data={stepsDataset} options={commonOptions} />
      </section>
    </div>
  );
}
