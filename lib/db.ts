import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI as string;

if (!MONGODB_URI) throw new Error("Missing MONGODB_URI in .env");

type MongooseGlobal = typeof globalThis & {
    mongoose?: { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null };
};

const globalWithMongoose = global as MongooseGlobal;
const cached = globalWithMongoose.mongoose || { conn: null, promise: null };

export async function connectDB() {
    if (cached.conn) return cached.conn;

    if (!cached.promise) {
        cached.promise = mongoose.connect(MONGODB_URI, {
            dbName: process.env.MONGODB_DB_NAME,
        }).then((mongoose) => mongoose);
    }

    cached.conn = await cached.promise;
    return cached.conn;
}
