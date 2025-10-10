import { NextRequest, NextResponse } from "next/server";
import { verifyJwt } from "@/lib/auth";
import { getDb } from "@/lib/mongo";

export async function GET(req: NextRequest) {
    const token = req.cookies.get("token")?.value;
    if (!token) return NextResponse.json({ user: null });
    const payload = verifyJwt<{ sub: string; role: string }>(token);
    if (!payload) return NextResponse.json({ user: null });
    const db = await getDb();
    const users = db.collection("users");
    const user = await users.findOne({ _id: new (await import("mongodb")).ObjectId(payload.sub) }, { projection: { passwordHash: 0 } });
    return NextResponse.json({ user });
}

export async function POST() {
    const res = NextResponse.json({ ok: true });
    res.cookies.set("token", "", { httpOnly: true, path: "/", maxAge: 0 });
    return res;
}


