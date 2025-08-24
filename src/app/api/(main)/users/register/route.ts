import connect from "@/lib/db";
import User from "@/lib/modals/user";
import { hash } from "bcryptjs";
import { NextResponse } from "next/server";

export const POST = async (req: Request) => {
  try {
    // Connect to the database
    await connect();

    // Parse the request body
    const body = await req.json();
    const { name, email, password, institution_id } = body;

    const existingEmail = await User.findOne({ email, is_delete: 0 });

    if (existingEmail) {
      return new NextResponse('User already exists', { status: 400 });
    }

    // Check if there's already a user for this institution (only if institution_id is provided)
    if (institution_id) {
      const existingUser = await User.findOne({ institution_id: institution_id, is_delete: 0 });
      if (existingUser) {
        return new NextResponse('Sudah ada user terdaftar pada lembaga ini', { status: 400 });
      }
    }

    const hashedPassword = await hash(password, 10);

    // Create a new user
    const newUser = new User({ name, email, password: hashedPassword, institution_id, status: 0 });
    await newUser.save();

    // Return the created user without password
    return new NextResponse(JSON.stringify({ message: 'User created successfully', data: newUser.toObject() }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Error creating user:', error);
    return new NextResponse('Internal Server Error' + error.message, { status: 500 });
  }
};
