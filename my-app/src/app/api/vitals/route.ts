import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongo";
import { verifyJwt } from "@/lib/auth";

function getUserIdFromReq(req: NextRequest): string | null {
    const token = req.cookies.get("token")?.value;
    if (!token) return null;
    const p = verifyJwt<{ sub: string }>(token);
    return p?.sub ?? null;
}

export async function GET(req: NextRequest) {
    const userId = getUserIdFromReq(req);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const db = await getDb();
    const vitals = db.collection("vitals");
    const items = await vitals
        .find({ userId }, { projection: { userId: 0 } })
        .sort({ date: -1 })
        .limit(30)
        .toArray();
    return NextResponse.json({ items });
}

export async function POST(req: NextRequest) {
    const userId = getUserIdFromReq(req);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const body = await req.json();
    const { date, sleep, heartRate, steps, water, diet, mood, stress, notes } = body;
    const db = await getDb();
    const vitals = db.collection("vitals");
    const doc = {
        userId,
        date: date ? new Date(date) : new Date(),
        sleep: Number(sleep) || 0,
        heartRate: Number(heartRate) || 0,
        steps: Number(steps) || 0,
        water: Number(water) || 0,
        diet: String(diet || ""),
        mood: Number(mood) || 0,
        stress: Number(stress) || 0,
        notes: String(notes || ""),
        createdAt: new Date(),
    };
    await vitals.insertOne(doc);
    return NextResponse.json({ ok: true });
}


