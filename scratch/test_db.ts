import mongoose from "mongoose";
import * as dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const uri = process.env.MONGODB_URI;

console.log("URI found:", uri ? "Yes" : "No");

async function testConnection() {
  console.log("Connecting...");
  try {
    await mongoose.connect(uri as string, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000,
    });
    console.log("Connected!");
    const collections = await mongoose.connection.db?.listCollections().toArray();
    console.log("Collections:", collections?.map(c => c.name));
    process.exit(0);
  } catch (error) {
    console.error("Error type:", error instanceof Error ? error.constructor.name : typeof error);
    console.error("Error message:", error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

testConnection();
