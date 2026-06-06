import { auth } from "@/auth";
import { connectMongoDB } from "@/lib/mongodb";
import Item from "@/models/Item";
import { NextRequest, NextResponse } from "next/server";


export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { title, description, dateAcquired } = await request.json();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const userId = (session.user as any).id || session.user.id;
    
    if (!userId) {
      return NextResponse.json({ message: "User ID missing" }, { status: 400 });
    }

    await connectMongoDB();
    const newItem = await Item.create({ title, description, userId, dateAcquired });
    

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

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const userId = (session.user as any).id || session.user.id;
    if (!userId) {
      return NextResponse.json({ items: [] });
    }



    await connectMongoDB();
    const items = await Item.find({ userId }).sort({
      createdAt: -1,
    });
    

    return NextResponse.json({ items });
  } catch (error) {
    console.error("GET /api/items - Error:", error);
    return NextResponse.json({ items: [], message: "Server Error" }, { status: 500 });
  }
}
