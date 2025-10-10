import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI as string;
if (!uri) {
    throw new Error("MONGODB_URI is not set");
}

let client: MongoClient | null = null;
let clientPromise: Promise<MongoClient> | null = null;

export function getMongoClient(): Promise<MongoClient> {
    if (clientPromise) return clientPromise;
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


