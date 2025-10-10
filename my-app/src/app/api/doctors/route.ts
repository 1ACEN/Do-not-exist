import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongo";
import { verifyJwt } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const db = await getDb();
    const users = db.collection("users");
    const docs = await users.find({ role: "doctor" }, { projection: { passwordHash: 0 } }).toArray();
    const items = docs.map(d => ({ id: d._id.toString(), name: d.name, specialization: d.specialization || "General", contact: d.email }));
    return NextResponse.json({ items });
  } catch (e) {
    console.error("Failed to list doctors", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
