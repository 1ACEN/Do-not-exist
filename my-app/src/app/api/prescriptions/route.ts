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

export async function GET(req: NextRequest) {
  try {
    // Allow clients to fetch their own prescriptions and doctors to fetch by userId query
    const token = req.cookies.get("token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const payload = verifyJwt<{ sub: string; role: string }>(token);
    if (!payload) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    const url = new URL(req.url);
    const qUserId = url.searchParams.get("userId");

    const db = await getDb();
    const prescriptions = db.collection("prescriptions");

    let query: any = {};
    if (payload.role === "doctor") {
      // doctor can request prescriptions for a specific patient
      if (qUserId) query.userId = qUserId;
      else query.doctorId = payload.sub;
    } else if (payload.role === "client") {
      // client only sees their own prescriptions
      query.userId = payload.sub;
    } else {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const items = await prescriptions.find(query).sort({ prescribedDate: -1 }).toArray();
    return NextResponse.json({ items: items.map(p => ({ id: p._id.toString(), medication: p.medication, dosage: p.dosage, frequency: p.frequency, duration: p.duration, prescribedDate: p.prescribedDate, notes: p.notes, isActive: p.isActive ?? true, isCompleted: p.isCompleted ?? false, doctorId: p.doctorId, userId: p.userId })) });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const payload = verifyJwt<{ sub: string; role: string }>(token);
    if (!payload) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    const body = await req.json();
    const { id, isCompleted, isActive } = body;
    if (!id || !ObjectId.isValid(id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

    const db = await getDb();
    const prescriptions = db.collection("prescriptions");
    const existing = await prescriptions.findOne({ _id: new ObjectId(id) });
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

    // Clients can only mark their own prescriptions completed; doctors can update their patients'
    if (payload.role === "client") {
      if (existing.userId !== payload.sub) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    } else if (payload.role === "doctor") {
      if (existing.doctorId !== payload.sub) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    } else {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const update: any = {};
    if (typeof isCompleted === "boolean") {
      update.isCompleted = isCompleted;
      // when completed, mark isActive false
      if (isCompleted) update.isActive = false;
    }
    if (typeof isActive === "boolean") update.isActive = isActive;

    await prescriptions.updateOne({ _id: new ObjectId(id) }, { $set: update });
  const updated = await prescriptions.findOne({ _id: new ObjectId(id) });
  if (!updated) return NextResponse.json({ error: "Not found after update" }, { status: 500 });
  return NextResponse.json({ ok: true, item: { id: updated._id.toString(), isCompleted: updated.isCompleted ?? false, isActive: updated.isActive ?? true } });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
