import { auth } from "@/auth";
import { connectMongoDB } from "@/lib/mongodb";
import Item from "@/models/Item";
import { NextRequest, NextResponse } from "next/server";


export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const userId = (session.user as any).id || session.user.id;
    const { id } = await params;
    await connectMongoDB();
    const deletedItem = await Item.findOneAndDelete({
      _id: id,
      userId: userId,
    });

    if (!deletedItem) {
      return NextResponse.json({ message: "Item not found or unauthorized" }, { status: 404 });
    }


    return NextResponse.json({ message: "Item deleted" }, { status: 200 });
  } catch (error) {
    console.error("DELETE /api/items/[id] - Error:", error);
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const userId = (session.user as any).id || session.user.id;
    const { id } = await params;
    const formData = await request.formData();
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const dateAcquiredString = formData.get("dateAcquired") as string;
    const dateAcquired = dateAcquiredString ? new Date(dateAcquiredString) : undefined;
    
    const updateQuery: any = { $set: { name, description, dateAcquired } };
    
    const imageFile = formData.get("image") as File | null;
    const removeImage = formData.get("removeImage") === "true";
    
    if (imageFile && imageFile.size > 0) {
      const arrayBuffer = await imageFile.arrayBuffer();
      updateQuery.$set.image = Buffer.from(arrayBuffer);
      updateQuery.$set.imageContentType = imageFile.type;
    } else if (removeImage) {
      updateQuery.$unset = { image: 1, imageContentType: 1 };
    }

    await connectMongoDB();
    const updatedItem = await Item.findOneAndUpdate(
      { _id: id, userId: userId },
      updateQuery,
      { new: true }
    ).select('-image');

    if (!updatedItem) {
      return NextResponse.json({ message: "Item not found or unauthorized" }, { status: 404 });
    }


    return NextResponse.json({ message: "Item updated", item: updatedItem }, { status: 200 });
  } catch (error) {
    console.error("PATCH /api/items/[id] - Error:", error);
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}
