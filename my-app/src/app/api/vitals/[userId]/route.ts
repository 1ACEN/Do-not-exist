import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongo";
import { verifyJwt } from "@/lib/auth";

function getAuth(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  if (!token) return null;
  return verifyJwt<{ sub: string; role?: string }>(token);
}

export async function GET(req: NextRequest, { params }: { params: { userId: string } }) {
  const auth = getAuth(req);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { userId } = params;
  if (!userId) return NextResponse.json({ error: "Missing userId" }, { status: 400 });
  if (auth.role !== "doctor" && auth.sub !== userId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const db = await getDb();
  const vitals = db.collection("vitals");
  const items = await vitals.find({ userId }, { projection: { userId: 0 } }).sort({ date: -1 }).limit(100).toArray();
  return NextResponse.json({ items });
}
