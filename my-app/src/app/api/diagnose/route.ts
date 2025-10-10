import { NextRequest, NextResponse } from "next/server";

// Mock disease prediction based on symptoms
function mockDiseasePrediction(symptoms: string[]): { prediction: string; confidence: string } {
    const symptomMap: { [key: string]: string[] } = {
        "Common Cold": ["Mild Fever", "Fatigue", "Chest Pain"],
        "Flu": ["Shivering", "Mild Fever", "Fatigue", "Muscle Weakness"],
        "Hypertension": ["Chest Pain", "Blurred And Distorted Vision", "Fatigue"],
        "Diabetes": ["Fatigue", "Blurred And Distorted Vision", "Muscle Weakness"],
        "Liver Disease": ["Acute Liver Failure", "Swelling Of Stomach", "Fatigue"],
        "Kidney Disease": ["Fluid Overload", "Swelling Of Stomach", "Fatigue"],
        "Thyroid Disorder": ["Enlarged Thyroid", "Fatigue", "Muscle Weakness"],
        "Gastrointestinal Issues": ["Vomiting", "Constipation", "Swelling Of Stomach"],
        "Skin Condition": ["Itching", "Skin Peeling", "Blister", "Pus Filled Pimples"],
        "Neurological Issues": ["Altered Sensorium", "Unsteadiness", "Muscle Weakness"],
        "Respiratory Issues": ["Chest Pain", "Mucoid Sputum", "Fatigue"],
        "Musculoskeletal Issues": ["Back Pain", "Knee Pain", "Muscle Weakness", "Cramps"]
    };

    // Count matches for each disease
    const diseaseScores: { [key: string]: number } = {};
    
    for (const [disease, diseaseSymptoms] of Object.entries(symptomMap)) {
        diseaseScores[disease] = diseaseSymptoms.filter(symptom => 
            symptoms.some(s => s.toLowerCase().includes(symptom.toLowerCase()) || 
                               symptom.toLowerCase().includes(s.toLowerCase()))
        ).length;
    }

    // Find the disease with the highest score
    const bestMatch = Object.entries(diseaseScores).reduce((a, b) => 
        a[1] > b[1] ? a : b
    );

    const [prediction, score] = bestMatch;
    const confidence = score > 2 ? "High" : score > 1 ? "Medium" : "Low";

    return { prediction, confidence };
}

export async function POST(req: NextRequest) {
    try {
        const { symptoms } = await req.json();
        
        if (!symptoms || !Array.isArray(symptoms) || symptoms.length === 0) {
            return NextResponse.json({ error: "Please select at least one symptom" }, { status: 400 });
        }

        // Try external API first
        try {
            // Create a timeout promise
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error('Request timeout')), 10000);
            });

            // Try multiple endpoints with different approaches
            let response: Response;
            let apiUsed = "";
            
            try {
                // First try: POST to /predict endpoint
                const fetchPromise = fetch("https://health-care-eclipse.onrender.com/predict", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Accept": "application/json",
                    },
                    body: JSON.stringify({ symptoms }),
                });
                response = await Promise.race([fetchPromise, timeoutPromise]) as Response;
                apiUsed = "predict endpoint";
            } catch (predictError) {
                console.log("Predict endpoint failed, trying root endpoint:", predictError);
                try {
                    // Second try: POST to root endpoint
                    const fetchPromise = fetch("https://health-care-eclipse.onrender.com/", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "Accept": "application/json",
                        },
                        body: JSON.stringify({ symptoms }),
                    });
                    response = await Promise.race([fetchPromise, timeoutPromise]) as Response;
                    apiUsed = "root endpoint";
                } catch (rootError) {
                    console.log("Root endpoint failed, trying GET request:", rootError);
                    // Third try: GET request to check if API is reachable
                    const fetchPromise = fetch("https://health-care-eclipse.onrender.com/", {
                        method: "GET",
                        headers: {
                            "Accept": "application/json",
                        },
                    });
                    response = await Promise.race([fetchPromise, timeoutPromise]) as Response;
                    apiUsed = "GET root endpoint";
                }
            }

            if (response.ok) {
                const data = await response.json();
                
                // Handle different possible JSON response formats
                if (data.prediction) {
                    return NextResponse.json({ 
                        prediction: data.prediction,
                        confidence: data.confidence || "High",
                        symptoms: symptoms,
                        note: `Using external API (${apiUsed})`
                    });
                } else if (data.disease) {
                    return NextResponse.json({ 
                        prediction: data.disease,
                        confidence: data.confidence || "High",
                        symptoms: symptoms,
                        note: `Using external API (${apiUsed})`
                    });
                } else if (data.result) {
                    return NextResponse.json({ 
                        prediction: data.result,
                        confidence: data.confidence || "High",
                        symptoms: symptoms,
                        note: `Using external API (${apiUsed})`
                    });
                } else if (data.diagnosis) {
                    return NextResponse.json({ 
                        prediction: data.diagnosis,
                        confidence: data.confidence || "High",
                        symptoms: symptoms,
                        note: `Using external API (${apiUsed})`
                    });
                } else {
                    // If the response structure is unexpected, fall back to mock
                    console.log("Unexpected API response format, using mock prediction");
                    const mockResult = mockDiseasePrediction(symptoms);
                    return NextResponse.json({ 
                        prediction: mockResult.prediction,
                        confidence: mockResult.confidence,
                        symptoms: symptoms,
                        note: `Using fallback prediction due to API format issues (tried ${apiUsed})`
                    });
                }
            } else {
                console.log(`External API returned ${response.status}, using mock prediction`);
                const mockResult = mockDiseasePrediction(symptoms);
                return NextResponse.json({ 
                    prediction: mockResult.prediction,
                    confidence: mockResult.confidence,
                    symptoms: symptoms,
                    note: "Using fallback prediction due to API unavailability"
                });
            }
        } catch (externalError) {
            console.log("External API failed, using mock prediction:", externalError);
            const mockResult = mockDiseasePrediction(symptoms);
            return NextResponse.json({ 
                prediction: mockResult.prediction,
                confidence: mockResult.confidence,
                symptoms: symptoms,
                note: "Using fallback prediction due to API connection issues"
            });
        }

    } catch (error) {
        console.error("Diagnosis error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}