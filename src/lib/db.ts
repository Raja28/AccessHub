import mongoose from "mongoose";

function mustGetMongoUri() {
  const uri = process.env.MONGO_URI;
  if (!uri) throw new Error("Missing MONGO_URI in environment");
  return uri;
}

declare global {
  var __mongooseConn: { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null } | undefined;
}

const globalForMongoose = globalThis as typeof globalThis & {
  __mongooseConn?: { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null };
};

export async function connectToDb() {
  const MONGO_URI = mustGetMongoUri();
  const cached =
    globalForMongoose.__mongooseConn ?? (globalForMongoose.__mongooseConn = { conn: null, promise: null });

  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGO_URI, {
      bufferCommands: false,
    });
    console.log("Connected to MongoDB");
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

