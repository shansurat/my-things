import { auth } from "@/auth";
import { connectMongoDB } from "@/lib/mongodb";
import Item from "@/models/Item";
import { NextRequest, NextResponse } from "next/server";
import { redis, CACHE_KEYS } from "@/lib/redis";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { title, description } = await request.json();
    const userId = (session.user as any).id || session.user.id;
    
    if (!userId) {
      return NextResponse.json({ message: "User ID missing" }, { status: 400 });
    }

    await connectMongoDB();
    const newItem = await Item.create({ title, description, userId });
    
    // Invalidate Cache
    if (redis) {
      try {
        await redis.del(CACHE_KEYS.userItems(userId));
      } catch (redisError) {
        console.warn("Failed to invalidate cache:", redisError);
      }
    }
    
    return NextResponse.json({ message: "Item Created", item: newItem }, { status: 201 });
  } catch (error) {
    console.error("POST /api/items - Error:", error);
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ items: [] });
    }

    const userId = (session.user as any).id || session.user.id;
    if (!userId) {
      return NextResponse.json({ items: [] });
    }

    const cacheKey = CACHE_KEYS.userItems(userId);
    let cachedData = null;

    // Try Cache
    if (redis) {
      try {
        cachedData = await redis.get(cacheKey);
        if (cachedData) {
          console.log(`GET /api/items - Cache HIT for user ${userId}`);
          return NextResponse.json({ items: cachedData });
        }
      } catch (redisError) {
        console.warn("Redis error, falling back to MongoDB:", redisError);
      }
    }

    console.log(`GET /api/items - Cache MISS for user ${userId}`);
    await connectMongoDB();
    const items = await Item.find({ userId }).sort({
      createdAt: -1,
    });
    
    // Set Cache (expire in 1 hour)
    if (redis) {
      try {
        await redis.set(cacheKey, JSON.stringify(items), { ex: 3600 });
      } catch (redisError) {
        console.warn("Failed to set cache:", redisError);
      }
    }

    return NextResponse.json({ items });
  } catch (error) {
    console.error("GET /api/items - Error:", error);
    return NextResponse.json({ items: [], message: "Server Error" }, { status: 500 });
  }
}
