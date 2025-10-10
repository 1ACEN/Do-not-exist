import jwt, { Secret } from "jsonwebtoken";
import bcrypt from "bcryptjs";

function getJwtSecret() {
    const s = process.env.JWT_SECRET as string | undefined;
    if (!s) {
        if (process.env.NODE_ENV === "production") {
            throw new Error(
                "JWT_SECRET is not set. Create a .env.local with JWT_SECRET or set the env var in your environment."
            );
        }

        // Development fallback: warn and use an ephemeral default secret so
        // the app doesn't crash during local development. Do NOT use this in prod.
        // This makes it easier to run the dev server without setting env vars.
        // If you need persistent dev sessions, set JWT_SECRET in `.env.local`.
        // eslint-disable-next-line no-console
        console.warn(
            "WARNING: JWT_SECRET is not set. Using an ephemeral fallback secret for development. Set JWT_SECRET in .env.local to silence this."
        );
        return "dev-fallback-secret";
    }
    return s;
}

export function signJwt(payload: object, expiresIn = "7d") {
    const secret = getJwtSecret() as Secret;
    // jwt types sometimes conflict with our setup; cast to any for a narrow scope
    return (jwt as any).sign(payload, secret, { expiresIn });
}

export function verifyJwt<T = any>(token: string): T | null {
    try {
        const secret = getJwtSecret();
        return (jwt as any).verify(token, secret) as T;
    } catch {
        return null;
    }
}

export async function hashPassword(password: string) {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
}

export async function comparePassword(password: string, hash: string) {
    return bcrypt.compare(password, hash);
}


