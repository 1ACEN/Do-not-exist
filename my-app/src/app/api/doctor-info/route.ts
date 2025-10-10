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

        // support multiple assigned doctors stored in doctorIds array
        const assignedIds: string[] = [];
        if (user.doctorIds && Array.isArray(user.doctorIds)) assignedIds.push(...user.doctorIds);
        else if (user.doctorId) assignedIds.push(user.doctorId);

        let doctor = null;
        if (assignedIds.length > 0) {
            const doctorsCol = db.collection("users");
            // fetch first doctor as primary for backward-compat display; full list can be returned if needed
            const docObj = assignedIds[0];
            try {
                doctor = await doctorsCol.findOne({ _id: new (await import("mongodb")).ObjectId(docObj), role: "doctor" });
            } catch (e) {
                doctor = null;
            }
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

        // Fetch general notices sent by the doctor to all assigned patients
    const noticesCol = db.collection("notices");
    const noticeQuery: any = {};
    if (assignedIds.length === 1) noticeQuery.doctorId = assignedIds[0];
    else if (assignedIds.length > 1) noticeQuery.doctorId = { $in: assignedIds };
    const generalNotices = assignedIds.length > 0 ? await noticesCol.find(noticeQuery).sort({ date: -1 }).toArray() : [];

        return NextResponse.json({
            // return the first found doctor as primary info and the full list of assigned ids
            doctorInfo: doctor ? {
                id: doctor._id.toString(),
                name: doctor.name,
                specialization: doctor.specialization || "General Practitioner",
                contact: doctor.email,
                assignedDate: user.doctorLastAssignedDate || new Date().toISOString()
            } : null,
            assignedDoctorIds: assignedIds,
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
            })),
            notices: generalNotices.map(n => ({ id: n._id.toString(), title: n.title, message: n.message, date: n.date }))
        });

    } catch (error) {
        console.error("Error fetching doctor information:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
