import { MongoClient } from "mongodb";

let client: MongoClient | null = null;
let clientPromise: Promise<MongoClient> | null = null;

function getUri() {
    // Accept multiple common environment variable names so local .env files
    // with slightly different keys (for example, `MONGODb_URI`) still work.
    const candidates = [
        process.env.MONGODB_URI,
        process.env.MONGODb_URI,
        process.env.MONGO_URI,
        process.env.MONGO_URL,
    ];
    const uri = candidates.find((v) => typeof v === "string" && v.length > 0) as string | undefined;
    if (!uri) {
        throw new Error(
            "MONGODB_URI is not set (tried MONGODB_URI, MONGODb_URI, MONGO_URI, MONGO_URL). Create a .env.local with the connection string or set the environment variable."
        );
    }
    return uri;
}

export function getMongoClient(): Promise<MongoClient> {
    if (clientPromise) return clientPromise;
    const uri = getUri();
    // Allow a developer opt-in to relax TLS verification in local/dev environments
    // by setting MONGODB_ALLOW_INVALID_CERT=true in .env.local (NOT for production).
    const allowInvalidCert = process.env.MONGODB_ALLOW_INVALID_CERT === "true";
    const enableTls = process.env.MONGODB_TLS === "true" || uri.startsWith("mongodb+srv://");

    const opts: any = {
        serverSelectionTimeoutMS: 5000,
        appName: "healthcare-eclipse",
    };
    if (enableTls) {
        opts.tls = true;
        if (allowInvalidCert) opts.tlsAllowInvalidCertificates = true;
    }

    client = new MongoClient(uri, opts);
    const start = Date.now();
    clientPromise = client.connect().then((c) => {
        const took = Date.now() - start;
        if (took > 1000) {
            console.warn(`MongoDB initial connect took ${took}ms`);
        } else {
            console.debug(`MongoDB connected in ${took}ms`);
        }
        return c;
    }).catch((err) => {
        console.error("Failed to connect to MongoDB:", err);
        // reset so future attempts can retry
        client = null;
        clientPromise = null;
        throw err;
    });
    return clientPromise;
}

export async function getDb(dbName = "healthcare-eclipse") {
    const c = await getMongoClient();
    return c.db(dbName);
}


