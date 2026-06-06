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

    const formData = await request.formData();
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const dateAcquiredString = formData.get("dateAcquired") as string;
    const dateAcquired = dateAcquiredString ? new Date(dateAcquiredString) : undefined;
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const userId = (session.user as any).id || session.user.id;
    
    if (!userId) {
      return NextResponse.json({ message: "User ID missing" }, { status: 400 });
    }

    let imageBuffer: Buffer | undefined = undefined;
    let imageContentType: string | undefined = undefined;
    
    const imageFile = formData.get("image") as File | null;
    if (imageFile && imageFile.size > 0) {
      const arrayBuffer = await imageFile.arrayBuffer();
      imageBuffer = Buffer.from(arrayBuffer);
      imageContentType = imageFile.type;
    }

    await connectMongoDB();
    const newItem = await Item.create({ name, description, userId, dateAcquired, image: imageBuffer, imageContentType });
    
    // Convert to plain object and remove image to save bandwidth in response
    const itemObj = newItem.toObject();
    delete itemObj.image;

    return NextResponse.json({ message: "Item Created", item: itemObj }, { status: 201 });
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
    const items = await Item.find({ userId }).select('-image').sort({
      createdAt: -1,
    });
    

    return NextResponse.json({ items });
  } catch (error) {
    console.error("GET /api/items - Error:", error);
    return NextResponse.json({ items: [], message: "Server Error" }, { status: 500 });
  }
}
