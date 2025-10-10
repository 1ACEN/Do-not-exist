import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const { symptoms } = await req.json();
        
        if (!symptoms || !Array.isArray(symptoms) || symptoms.length === 0) {
            return NextResponse.json({ error: "Please select at least one symptom" }, { status: 400 });
        }

        // Forward to external Flask API
        const response = await fetch("https://health-care-eclipse.onrender.com/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ symptoms }),
        });

        if (!response.ok) {
            return NextResponse.json({ error: "Failed to get prediction" }, { status: 500 });
        }

        // Parse JSON response
        const data = await response.json();
        
        // Handle different possible JSON response formats
        if (data.prediction) {
            return NextResponse.json({ 
                prediction: data.prediction,
                confidence: data.confidence || "High",
                symptoms: symptoms
            });
        } else if (data.disease) {
            return NextResponse.json({ 
                prediction: data.disease,
                confidence: data.confidence || "High",
                symptoms: symptoms
            });
        } else if (data.result) {
            return NextResponse.json({ 
                prediction: data.result,
                confidence: data.confidence || "High",
                symptoms: symptoms
            });
        } else if (data.diagnosis) {
            return NextResponse.json({ 
                prediction: data.diagnosis,
                confidence: data.confidence || "High",
                symptoms: symptoms
            });
        } else {
            // If the response structure is unexpected, return the raw data
            return NextResponse.json({ 
                prediction: JSON.stringify(data),
                confidence: "Unknown",
                symptoms: symptoms,
                rawData: data
            });
        }

    } catch (error) {
        console.error("Diagnosis error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}