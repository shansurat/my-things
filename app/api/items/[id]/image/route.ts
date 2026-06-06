import { connectMongoDB } from "@/lib/mongodb";
import Item from "@/models/Item";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    await connectMongoDB();
    const item = await Item.findById(id).select('image imageContentType');

    if (!item || !item.image) {
      return NextResponse.json({ message: "Image not found" }, { status: 404 });
    }

    const response = new NextResponse(item.image);
    response.headers.set('Content-Type', item.imageContentType || 'application/octet-stream');
    response.headers.set('Cache-Control', 'public, max-age=3600');
    return response;
  } catch (error) {
    console.error("GET /api/items/[id]/image - Error:", error);
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}
