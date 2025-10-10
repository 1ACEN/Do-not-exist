import { NextResponse } from "next/server";

// Simple GET handler that returns mock timeseries data: date, liters, steps
export async function GET() {
  // Generate 14 days of sample data ending today
  const days = 14;
  const now = new Date();
  const data = Array.from({ length: days }).map((_, i) => {
    const d = new Date(now);
    d.setDate(now.getDate() - (days - 1 - i));
    const date = d.toISOString().slice(0, 10);

    // Mock liters between 0.5 and 3.5
    const litres = +(0.5 + Math.random() * 3).toFixed(2);

    // Mock steps between 1500 and 15000
    const steps = Math.floor(1500 + Math.random() * 13500);

    return { date, litres, steps };
  });

  return NextResponse.json({ data });
}
