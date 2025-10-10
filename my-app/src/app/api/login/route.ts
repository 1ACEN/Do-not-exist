import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongo";
import { comparePassword, signJwt } from "@/lib/auth";

export async function POST(req: NextRequest) {
    try {
        const { role, email, password, doctorId } = await req.json();
        // Log the incoming attempt (do NOT log password)
        console.debug(`[login] attempt for email=${String(email)} role=${String(role)}${doctorId ? ` doctorId=${String(doctorId)}` : ""}`);
        const db = await getDb();
        const users = db.collection("users");

        const user = await users.findOne({ email, role });
        if (!user) {
            console.debug(`[login] user not found for email=${String(email)} role=${String(role)}`);
            return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
        }

        // For both clients and doctors, authenticate with email + password
        if (!password || !user.passwordHash) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
        const ok = await comparePassword(password, user.passwordHash);
        if (!ok) {
            console.debug(`[login] password mismatch for userId=${user._id?.toString?.() ?? String(user._id)}`);
            return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
        }

    const token = signJwt({ sub: user._id.toString(), role: user.role });
    console.debug(`[login] success for userId=${user._id.toString()} role=${user.role}`);
        const res = NextResponse.json({ ok: true, role: user.role });
        res.cookies.set("token", token, { httpOnly: true, path: "/", sameSite: "lax" });
        return res;
    } catch (e: any) {
        console.error(e);
        return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 });
    }
}


