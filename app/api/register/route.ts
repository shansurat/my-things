import { connectMongoDB } from "@/lib/mongodb";
import User from "@/models/User";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();
    console.log("Registration attempt for:", username);

    if (!username || !password) {
      return NextResponse.json(
        { message: "Username and password are required" },
        { status: 400 }
      );
    }

    await connectMongoDB();
    console.log("Connected to MongoDB for registration");

    // Check if user already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      console.log("User already exists:", username);
      return NextResponse.json(
        { message: "Username already exists" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await User.create({ username, password: hashedPassword });
    console.log("User created successfully:", username);

    return NextResponse.json({ message: "User registered" }, { status: 201 });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { message: "An error occurred during registration" },
      { status: 500 }
    );
  }
}
