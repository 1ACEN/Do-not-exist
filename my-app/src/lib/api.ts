export type PredictInput = {
    heartRate?: number;
    bloodPressureSys?: number;
    bloodPressureDia?: number;
    sleep?: number;
    stress?: number;
};

export type PredictResponse = {
    predictedDisease: string;
    accuracy: number; // 0-100
    riskScore: number; // 0-1
};

export async function fetchPrediction(input: PredictInput): Promise<PredictResponse> {
    const res = await fetch("/api/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
    });
    if (!res.ok) {
        throw new Error("Prediction API failed");
    }
    return (await res.json()) as PredictResponse;
}


