import connect from '@/lib/db';
import User from '@/lib/modals/user';
import { NextRequest, NextResponse } from 'next/server';
import { Types } from 'mongoose';
import { getToken } from 'next-auth/jwt';
import ActivityLog from '@/lib/modals/logs';

export const PATCH = async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const user_id = token.id;
    const { id } = await params;

    if (!id || !Types.ObjectId.isValid(id)) {
      return new NextResponse('Invalid user ID', { status: 400 });
    }

    // Connect to the database
    await connect();

    // Find the user by ID and check if exists and not deleted
    const existingUser = await User.findOne({ _id: id, is_delete: 0 }).select('-password');

    if (!existingUser) {
      return new NextResponse('User not found', { status: 404 });
    }

    // Toggle status: if current status is 1, change to 0; if 0, change to 1
    const newStatus = existingUser.status === 1 ? 0 : 1;

    // Update user status
    const updatedUser = await User.findByIdAndUpdate(id, { status: newStatus }, { new: true, runValidators: true }).select('-password');

    if (!updatedUser) {
      return new NextResponse('Failed to update user status', { status: 500 });
    }

    // Log activity
    await ActivityLog.create({
      user_id: user_id,
      action: 'update',
      description: `Mengubah status user ${updatedUser.name} menjadi ${newStatus === 1 ? 'aktif' : 'nonaktif'}`,
      module: 'User',
    });

    // Return success message with updated user data
    return new NextResponse(
      JSON.stringify({
        message: `User status updated successfully to ${newStatus === 1 ? 'active' : 'inactive'}`,
        data: updatedUser,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error updating user status:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
};
