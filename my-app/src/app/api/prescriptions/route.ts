import { NextRequest, NextResponse } from "next/server";
import { verifyJwt } from "@/lib/auth";
import { getDb } from "@/lib/mongo";
import { ObjectId } from "mongodb";

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const payload = verifyJwt<{ sub: string; role: string }>(token);
    if (!payload || payload.role !== "doctor") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const body = await req.json();
    const { userId, medication, dosage, frequency, duration, notes } = body;
    if (!userId || !ObjectId.isValid(userId) || !medication) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

    const db = await getDb();
    const prescriptions = db.collection("prescriptions");
    const doc = {
      doctorId: payload.sub,
      userId,
      medication,
      dosage: dosage || "",
      frequency: frequency || "",
      duration: duration || "",
      notes: notes || "",
      prescribedDate: new Date(),
      isActive: true,
    };
    const r = await prescriptions.insertOne(doc);
  const inserted = await prescriptions.findOne({ _id: r.insertedId });
  if (!inserted) return NextResponse.json({ error: "Insert failed" }, { status: 500 });
  return NextResponse.json({ ok: true, item: { id: inserted._id.toString(), medication: inserted.medication, dosage: inserted.dosage, frequency: inserted.frequency, duration: inserted.duration, prescribedDate: inserted.prescribedDate, notes: inserted.notes } });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
