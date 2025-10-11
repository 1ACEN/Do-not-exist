import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongo";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, message } = body || {};
    if (!name || !email || !message) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });

    // try to save to DB if available
    try {
      const db = await getDb();
      const col = db.collection('contact_messages');
      await col.insertOne({ name, email, message, createdAt: new Date() });
    } catch (dbErr) {
      // if DB not available just log and continue
      console.warn('Contact API: failed to save to DB', dbErr);
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
