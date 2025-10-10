import { NextRequest, NextResponse } from "next/server";
import { verifyJwt } from "@/lib/auth";
import { getDb } from "@/lib/mongo";

export async function GET(req: NextRequest) {
    try {
        const token = req.cookies.get("token")?.value;
        if (!token) {
            return NextResponse.json({ error: "No token provided" }, { status: 401 });
        }

        const payload = verifyJwt<{ sub: string; role: string }>(token);
        if (!payload) {
            return NextResponse.json({ error: "Invalid token" }, { status: 401 });
        }

        // Only clients can access their doctor information
        if (payload.role !== "client") {
            return NextResponse.json({ error: "Access denied" }, { status: 403 });
        }

        const db = await getDb();
        const users = db.collection("users");
        const user = await users.findOne({ _id: new (await import("mongodb")).ObjectId(payload.sub) });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Check if user has a doctor assigned
        if (!user.doctorId) {
            return NextResponse.json({ 
                doctorInfo: null,
                prescriptions: [],
                doctorNotes: []
            });
        }

        // Fetch doctor information
        const doctors = db.collection("users");
        const doctor = await doctors.findOne({ 
            _id: new (await import("mongodb")).ObjectId(user.doctorId),
            role: "doctor"
        });

        if (!doctor) {
            return NextResponse.json({ 
                doctorInfo: null,
                prescriptions: [],
                doctorNotes: []
            });
        }

        // Fetch prescriptions for this user
        const prescriptions = db.collection("prescriptions");
        const userPrescriptions = await prescriptions.find({ 
            userId: payload.sub,
            isActive: true 
        }).toArray();

        // Fetch doctor notes for this user
        const notes = db.collection("doctorNotes");
        const userNotes = await notes.find({ 
            userId: payload.sub 
        }).sort({ date: -1 }).toArray();

        return NextResponse.json({
            doctorInfo: {
                id: doctor._id.toString(),
                name: doctor.name,
                specialization: doctor.specialization || "General Practitioner",
                contact: doctor.email,
                assignedDate: user.doctorAssignedDate || new Date().toISOString()
            },
            prescriptions: userPrescriptions.map(pres => ({
                id: pres._id.toString(),
                medication: pres.medication,
                dosage: pres.dosage,
                frequency: pres.frequency,
                duration: pres.duration,
                prescribedDate: pres.prescribedDate,
                notes: pres.notes
            })),
            doctorNotes: userNotes.map(note => ({
                id: note._id.toString(),
                date: note.date,
                note: note.note,
                type: note.type || "general"
            }))
        });

    } catch (error) {
        console.error("Error fetching doctor information:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
