import connect from '@/lib/db';
import User from '@/lib/modals/user';
import { NextRequest, NextResponse } from 'next/server';
import { Types } from 'mongoose';
import { hash } from 'bcryptjs';
import '@/lib/modals/institution';
import { getToken } from 'next-auth/jwt';

export const GET = async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
  try {
    const { id } = await params;

    if (!id || !Types.ObjectId.isValid(id)) {
      return new NextResponse('Invalid user ID', { status: 400 });
    }
    // Connect to the database
    await connect();

    // Fetch user by ID from the database
    const user = await User.findOne({ _id: id, is_delete: 0 }).select('-password').populate({ path: 'institution_id', select: 'name' }).lean();

    // Return the users as JSON response
    return new NextResponse(JSON.stringify(user), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
};

export const PATCH = async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  try {
    // const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    // if (!token) {
    //   return new NextResponse('Unauthorized', { status: 401 });
    // }

    const { id } = await params;

    // Parse the request body
    const body = await req.json();
    const { name, email, password, role, institution_id } = body;
    if (!id || !Types.ObjectId.isValid(id)) {
      return new NextResponse('Invalid user ID', { status: 400 });
    }
    // Connect to the database
    await connect();

    const hashedPassword = await hash(password, 10);

    // Find the user by ID and update
    const updatedUser = await User.findByIdAndUpdate(id, { name, email, password: hashedPassword, role, institution_id }, { new: true, runValidators: true }).select('-password');

    if (!updatedUser) {
      return new NextResponse('User not found', { status: 404 });
    }

    // Return the updated user
    return new NextResponse(JSON.stringify(updatedUser), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error updating user:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
};

export const DELETE = async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
  try {
    const { id } = await params;

    if (!id || !Types.ObjectId.isValid(id)) {
      return new NextResponse('Invalid user ID', { status: 400 });
    }

    // Connect to the database
    await connect();

    // Find the user by ID and soft delete (set is_delete = 1)
    const deletedUser = await User.findByIdAndUpdate(id, { is_delete: 1 }, { new: true }).select('-password');

    if (!deletedUser) {
      return new NextResponse('User not found', { status: 404 });
    }

    // Return success message
    return new NextResponse(JSON.stringify({ message: 'User deleted successfully' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
};
