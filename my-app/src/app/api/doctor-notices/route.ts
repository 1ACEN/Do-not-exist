import { NextRequest, NextResponse } from "next/server";
import { verifyJwt } from "@/lib/auth";
import { getDb } from "@/lib/mongo";

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const payload = verifyJwt<{ sub: string; role: string }>(token);
    if (!payload || payload.role !== "doctor") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const body = await req.json();
    const { title, message } = body;
    if (!message) return NextResponse.json({ error: "Message required" }, { status: 400 });

    const db = await getDb();
    const notices = db.collection("notices");
    const doc = {
      doctorId: payload.sub,
      title: title || "Important",
      message,
      date: new Date(),
    };
    const r = await notices.insertOne(doc);
  const inserted = await notices.findOne({ _id: r.insertedId });
  if (!inserted) return NextResponse.json({ error: "Insert failed" }, { status: 500 });
  return NextResponse.json({ ok: true, item: { id: inserted._id.toString(), title: inserted.title, message: inserted.message, date: inserted.date } });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
