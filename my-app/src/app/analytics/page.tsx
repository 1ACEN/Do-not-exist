"use client";

import dynamic from "next/dynamic";
const AnalyticsCharts = dynamic(() => import("@/components/analytics-charts"), { ssr: false });

export default function AnalyticsPage() {
  return (
    <div>
      <AnalyticsCharts />
    </div>
  );
}
