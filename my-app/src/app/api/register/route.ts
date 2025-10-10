import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongo";
import { hashPassword, signJwt } from "@/lib/auth";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { role, name, age, height, weight, email, password, doctorId } = body as {
            role: "client" | "doctor";
            name: string;
            age?: number;
            height?: number;
            weight?: number;
            email: string;
            password?: string;
            doctorId?: string;
        };

        if (!role || !name || !email) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const db = await getDb();
        const users = db.collection("users");

        const existing = await users.findOne({ email });
        if (existing) {
            return NextResponse.json({ error: "Email already registered" }, { status: 409 });
        }

        let user: any = { role, name, email, createdAt: new Date() };

        if (role === "client") {
            if (typeof age !== "number" || typeof height !== "number" || typeof weight !== "number" || !password) {
                return NextResponse.json({ error: "Missing client fields" }, { status: 400 });
            }
            user.age = age;
            user.height = height;
            user.weight = weight;
            user.passwordHash = await hashPassword(password);
        } else {
            if (typeof age !== "number" || !doctorId) {
                return NextResponse.json({ error: "Missing doctor fields" }, { status: 400 });
            }
            user.age = age;
            user.doctorId = doctorId;
        }

        const { insertedId } = await users.insertOne(user);
        const token = signJwt({ sub: insertedId.toString(), role });

        const res = NextResponse.json({ ok: true, userId: insertedId.toString(), role });
        res.cookies.set("token", token, { httpOnly: true, path: "/", sameSite: "lax" });
        return res;
    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}


