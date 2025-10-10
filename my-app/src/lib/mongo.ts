import { MongoClient } from "mongodb";

let client: MongoClient | null = null;
let clientPromise: Promise<MongoClient> | null = null;

function getUri() {
    const uri = process.env.MONGODB_URI as string | undefined;
    if (!uri) {
        throw new Error(
            "MONGODB_URI is not set. Create a .env.local file with MONGODB_URI or set the environment variable. See .env.local.example."
        );
    }
    return uri;
}

export function getMongoClient(): Promise<MongoClient> {
    if (clientPromise) return clientPromise;
    const uri = getUri();
    client = new MongoClient(uri, {
        serverSelectionTimeoutMS: 5000,
        appName: "healthcare-eclipse",
    });
    clientPromise = client.connect();
    return clientPromise;
}

export async function getDb(dbName = "healthcare-eclipse") {
    const c = await getMongoClient();
    return c.db(dbName);
}


