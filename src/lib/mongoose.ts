import mongoose from "mongoose";

declare global {
  var mongooseConnection: typeof mongoose | undefined;
}

const cached = globalThis.mongooseConnection ?? mongoose;

if (process.env.NODE_ENV !== "production") {
  globalThis.mongooseConnection = cached;
}

export async function connectToDatabase() {
  const uri = process.env.MONGODB_URI;
  
  if (!uri) {
    throw new Error("Please define the MONGODB_URI environment variable in .env.local");
  }

  if (cached.connection.readyState >= 1) {
    return cached;
  }

  await cached.connect(uri!);
  return cached;
}

export default cached;