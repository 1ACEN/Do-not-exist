// Lightweight anomaly detection helpers for vitals
// Strategies used:
// - Z-score (mean/std) over recent window
// - MAD fallback when std is too small
// - Sudden jump detection (percent or absolute thresholds per metric)

function mean(arr: number[]) {
  if (!arr.length) return 0;
  return arr.reduce((s, v) => s + v, 0) / arr.length;
}

function stddev(arr: number[], mu?: number) {
  if (!arr.length) return 0;
  const m = mu ?? mean(arr);
  const v = arr.reduce((s, x) => s + (x - m) ** 2, 0) / arr.length;
  return Math.sqrt(v);
}

function median(arr: number[]) {
  if (!arr.length) return 0;
  const a = [...arr].sort((x, y) => x - y);
  const mid = Math.floor(a.length / 2);
  return a.length % 2 === 0 ? (a[mid - 1] + a[mid]) / 2 : a[mid];
}

function mad(arr: number[]) {
  const med = median(arr);
  const deviations = arr.map((x) => Math.abs(x - med));
  return median(deviations);
}

export type Anomaly = {
  itemId: string | number;
  metric: string;
  value: number | null;
  score: number; // z-score or normalized score
  reason: string;
};

type Options = {
  window?: number; // how many recent points to consider
  zThreshold?: number; // z-score threshold
  jumpPct?: number; // percent jump threshold (e.g., 0.3 for 30%)
};

const DEFAULTS: Options = {
  window: 30,
  zThreshold: 2.7,
  jumpPct: 0.3,
};

// metricsExtractor: map metric name -> value from item
const DEFAULT_METRICS: { [k: string]: (it: any) => number | null } = {
  heartRate: (it) => (it.heartRate != null ? Number(it.heartRate) : null),
  systolic: (it) => (it.systolic != null ? Number(it.systolic) : (it.bloodPressure?.systolic != null ? Number(it.bloodPressure.systolic) : null)),
  diastolic: (it) => (it.diastolic != null ? Number(it.diastolic) : (it.bloodPressure?.diastolic != null ? Number(it.bloodPressure.diastolic) : null)),
  sleep: (it) => (it.sleep != null ? Number(it.sleep) : null),
  steps: (it) => (it.steps != null ? Number(it.steps) : null),
  temperature: (it) => (it.temperature != null ? Number(it.temperature) : null),
  mood: (it) => (it.mood != null ? Number(it.mood) : null),
  stress: (it) => (it.stress != null ? Number(it.stress) : null),
};

export function detectAnomalies(items: any[], opts?: Options): Anomaly[] {
  const o = { ...DEFAULTS, ...(opts || {}) };
  const anomalies: Anomaly[] = [];

  if (!Array.isArray(items) || items.length === 0) return anomalies;

  // For each metric, build array of recent values (most recent N)
  const metrics = Object.keys(DEFAULT_METRICS);
  for (const metric of metrics) {
    const extractor = DEFAULT_METRICS[metric];
    // Build array with values and corresponding item ids
    const vals: { id: any; value: number; date?: string }[] = [];
    for (const it of items) {
      const v = extractor(it);
      if (v == null || Number.isNaN(v)) continue;
      vals.push({ id: it._id ?? it.id ?? items.indexOf(it), value: Number(v), date: it.date });
    }
    if (vals.length < 2) continue;

    // consider last o.window values (they may already be sorted desc in DB)
    const windowVals = vals.slice(0, o.window).map((v) => v.value).reverse();
    // if less than 2 values, skip
    if (windowVals.length < 2) continue;

    const mu = mean(windowVals);
    const sd = stddev(windowVals, mu);
    const m = median(windowVals);
    const madv = mad(windowVals);

    // For each value, compute z or mad-based score
    for (let i = 0; i < windowVals.length; i++) {
      const value = windowVals[i];
      const itemRef = vals[vals.length - windowVals.length + i];
      let score = 0;
      let reason = "";

      if (sd > 1e-6) {
        score = (value - mu) / sd;
        if (Math.abs(score) >= o.zThreshold!) {
          reason = `z-score ${score.toFixed(2)} out of threshold ${o.zThreshold}`;
          anomalies.push({ itemId: itemRef.id, metric, value, score: Number(score.toFixed(2)), reason });
          continue;
        }
      } else if (madv > 0) {
        // use MAD scaled to approx std: 1.4826 * MAD
        const approxSd = 1.4826 * madv;
        score = (value - m) / approxSd;
        if (Math.abs(score) >= o.zThreshold!) {
          reason = `mad-score ${score.toFixed(2)} out of threshold ${o.zThreshold}`;
          anomalies.push({ itemId: itemRef.id, metric, value, score: Number(score.toFixed(2)), reason });
          continue;
        }
      }

      // sudden jump detection from previous point in window
      if (i > 0) {
        const prev = windowVals[i - 1];
        if (prev !== 0) {
          const pct = Math.abs(value - prev) / Math.max(Math.abs(prev), 1);
          if (pct >= o.jumpPct!) {
            reason = `sudden change ${(pct * 100).toFixed(0)}% from previous`;
            anomalies.push({ itemId: itemRef.id, metric, value, score: Number((pct * 100).toFixed(1)), reason });
            continue;
          }
        }
      }
    }
  }

  // Additional composite checks (example: large BP difference between systolic/diastolic)
  // For now keep it simple and return per-metric anomalies above.

  return anomalies;
}

export default { detectAnomalies };
