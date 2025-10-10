import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { heartRate = 72, bloodPressureSys = 120, bloodPressureDia = 80, sleep = 7, stress = 3 } = body ?? {};

        // Simple mock scoring for demo purposes
        const riskScore = Math.min(
            1,
            Math.max(
                0,
                (heartRate - 60) / 60 * 0.25 +
                    ((bloodPressureSys - 110) / 50) * 0.3 +
                    ((bloodPressureDia - 70) / 30) * 0.2 +
                    ((6 - Math.min(8, sleep)) / 6) * 0.15 +
                    (stress / 10) * 0.1
            )
        );

        const diseases = ["Hypertension Risk", "Cardiometabolic Risk", "Stress-induced Arrhythmia", "No Significant Risk"];
        const predictedDisease = riskScore > 0.7 ? diseases[0] : riskScore > 0.5 ? diseases[1] : riskScore > 0.3 ? diseases[2] : diseases[3];
        const accuracy = Math.round((0.6 + riskScore * 0.4) * 100);

        return NextResponse.json({ predictedDisease, accuracy, riskScore });
    } catch (e) {
        return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }
}


