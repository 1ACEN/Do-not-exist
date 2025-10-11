import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongo";
import { verifyJwt } from "@/lib/auth";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const payload = verifyJwt<{ sub: string; role?: string }>(token);
    if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = params;
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    // Only doctors or the user themselves can fetch this details
    if (payload.role !== "doctor" && payload.sub !== id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const db = await getDb();
    const users = db.collection("users");
    const user = await users.findOne({ _id: new (require("mongodb").ObjectId)(id) }, { projection: { passwordHash: 0 } });
    if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json({ user });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
