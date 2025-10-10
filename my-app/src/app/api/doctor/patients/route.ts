import { NextRequest, NextResponse } from "next/server";
import { verifyJwt } from "@/lib/auth";
import { getDb } from "@/lib/mongo";

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const payload = verifyJwt<{ sub: string; role: string }>(token);
    if (!payload || payload.role !== "doctor") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const db = await getDb();
    const users = db.collection("users");
  // support multiple assignments: users may have doctorIds array
  const patients = await users.find({ $or: [ { doctorId: payload.sub }, { doctorIds: payload.sub } ] }, { projection: { passwordHash: 0 } }).toArray();
    const items = patients.map(p => ({ id: p._id.toString(), name: p.name, email: p.email, age: p.age, assignedDate: p.doctorAssignedDate }));
    return NextResponse.json({ items });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
