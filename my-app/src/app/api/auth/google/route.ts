import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const redirect = process.env.GOOGLE_REDIRECT_URI;
    if (!clientId || !redirect) {
        return NextResponse.json({ error: "Google OAuth not configured" }, { status: 500 });
    }

    // Allow callers to pass ?role=doctor or ?role=client; round-trip via `state`
    // so the callback can assign a role for newly-created users. Default to "client".
    const url = new URL(req.url);
    const requestedRole = url.searchParams.get("role") || "client";

    const params = new URLSearchParams({
        client_id: clientId,
        redirect_uri: redirect,
        response_type: "code",
        scope: ["openid", "profile", "email"].join(" "),
        access_type: "offline",
        prompt: "consent",
        state: requestedRole,
    });

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
    return NextResponse.redirect(authUrl);
}
