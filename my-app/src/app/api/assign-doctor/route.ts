import { NextRequest, NextResponse } from "next/server";
import { verifyJwt } from "@/lib/auth";
import { getDb } from "@/lib/mongo";
import { ObjectId } from "mongodb";

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const payload = verifyJwt<{ sub: string; role: string }>(token);
    if (!payload || payload.role !== "client") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const body = await req.json();
    const { doctorId } = body;
    if (!doctorId || !ObjectId.isValid(doctorId)) return NextResponse.json({ error: "Invalid doctorId" }, { status: 400 });

    const db = await getDb();
    const users = db.collection("users");
    // Ensure doctor exists
    const doctor = await users.findOne({ _id: new ObjectId(doctorId), role: "doctor" });
    if (!doctor) return NextResponse.json({ error: "Doctor not found" }, { status: 404 });

    // allow multiple doctor assignments; add to doctorIds array on the user
    await users.updateOne(
      { _id: new ObjectId(payload.sub) },
      { $addToSet: { doctorIds: doctorId }, $set: { doctorLastAssignedDate: new Date() } }
    );

    return NextResponse.json({ ok: true, doctor: { id: doctor._id.toString(), name: doctor.name, specialization: doctor.specialization || "General", contact: doctor.email } });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
