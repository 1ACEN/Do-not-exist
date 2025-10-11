import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongo";
import { verifyJwt } from "@/lib/auth";
import { ObjectId } from "mongodb";
import { detectAnomalies } from "@/lib/anomaly";

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
    // detect simple anomalies on the server and return alongside items
    try {
        const anomalies = detectAnomalies(items || []);
        return NextResponse.json({ items, anomalies });
    } catch (e) {
        // if anomaly detection fails, still return items
        return NextResponse.json({ items });
    }
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

export async function PUT(req: NextRequest) {
    const userId = getUserIdFromReq(req);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    const body = await req.json();
    const bodyId = body?.id;
    const useId = id || bodyId;
    if (!useId || !ObjectId.isValid(useId)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

    const allowed = ["date","sleep","heartRate","steps","water","diet","mood","stress","notes","systolic","diastolic"];
    const updates: any = {};
    for (const k of allowed) if (k in body) updates[k] = body[k];
    if (updates.date) updates.date = new Date(updates.date);

    const db = await getDb();
    const vitals = db.collection("vitals");
    const res = await vitals.findOneAndUpdate({ _id: new ObjectId(useId), userId }, { $set: updates }, { returnDocument: "after" as any });
    if (!res || !res.value) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ ok: true, item: res.value });
}

export async function DELETE(req: NextRequest) {
    const userId = getUserIdFromReq(req);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    const body = await req.json().catch(() => ({}));
    const bodyId = body?.id;
    const useId = id || bodyId;
    if (!useId || !ObjectId.isValid(useId)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

    const db = await getDb();
    const vitals = db.collection("vitals");
    const r = await vitals.deleteOne({ _id: new ObjectId(useId), userId });
    if (r.deletedCount === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ ok: true });
}


