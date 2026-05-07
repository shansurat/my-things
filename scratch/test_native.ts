import { MongoClient } from "mongodb";
import * as dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const uri = process.env.MONGODB_URI;

async function testNative() {
  console.log("URI found:", uri ? "Yes" : "No");
  console.log("Connecting with native driver...");
  const client = new MongoClient(uri as string, {
    serverSelectionTimeoutMS: 5000,
    connectTimeoutMS: 5000,
  });

  try {
    await client.connect();
    console.log("Connected with native driver!");
    const db = client.db();
    const collections = await db.listCollections().toArray();
    console.log("Collections:", collections.map(c => c.name));
    await client.close();
    process.exit(0);
  } catch (error) {
    console.error("Native error:", error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

testNative();
