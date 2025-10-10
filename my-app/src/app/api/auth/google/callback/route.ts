import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongo";
import { signJwt } from "@/lib/auth";

async function exchangeCode(code: string) {
    const clientId = process.env.GOOGLE_CLIENT_ID!;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET!;
    const redirect = process.env.GOOGLE_REDIRECT_URI!;

    const params = new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirect,
        grant_type: "authorization_code",
    });

    const res = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: params.toString(),
    });
    if (!res.ok) throw new Error("Failed to exchange code");
    return res.json();
}

async function fetchProfile(accessToken: string) {
    const res = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
        headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!res.ok) throw new Error("Failed to fetch profile");
    return res.json();
}

export async function GET(req: NextRequest) {
    try {
        const url = new URL(req.url);
        const code = url.searchParams.get("code");
        const error = url.searchParams.get("error");
        if (error) return NextResponse.redirect(new URL("/login", req.url));
        if (!code) return NextResponse.json({ error: "No code provided" }, { status: 400 });

        const tokenResp: any = await exchangeCode(code);
        const accessToken = tokenResp.access_token as string;
        if (!accessToken) throw new Error("No access token returned");

        const profile: any = await fetchProfile(accessToken);
        const email = profile.email as string | undefined;
        const name = profile.name as string | undefined;
        const picture = profile.picture as string | undefined;

        if (!email) throw new Error("Google profile has no email");

    // Determine requested role from state (set in redirect). Default to 'client'.
    const requestedRole = (url.searchParams.get("state") as string | null) || "client";

    const db = await getDb();
        const users = db.collection("users");

        // Try to find an existing user by email
        let user = await users.findOne({ email }) as any | null;
        if (!user) {
            const now = new Date();
            // Create a lightweight user record for Google sign-ins.
            // We don't require the same fields as manual registration (age/height/weight).
            const newUser: any = {
                email,
                name,
                picture,
                role: requestedRole === "doctor" ? "doctor" : "client",
                createdAt: now,
                google: true,
                emailVerified: true,
            };
            const { insertedId } = await users.insertOne(newUser);
            user = await users.findOne({ _id: insertedId }) as any | null;
        }

        if (!user) throw new Error("Failed to create or find user");

        const token = signJwt({ sub: user._id.toString(), role: user.role });
        const res = NextResponse.redirect(new URL("/", req.url));
        res.cookies.set("token", token, { httpOnly: true, path: "/", sameSite: "lax" });
        return res;
    } catch (e) {
        // Log and redirect to login with a failure notice
        // eslint-disable-next-line no-console
        console.error(e);
        return NextResponse.redirect(new URL("/login?error=oauth" , req.url));
    }
}
