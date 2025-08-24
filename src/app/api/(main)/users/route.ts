import connect from '@/lib/db';
import User from '@/lib/modals/user';
import { NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import '@/lib/modals/institution';

export const GET = async (req: Request) => {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const statusParam = searchParams.get('status');
    const status = statusParam ? parseInt(statusParam, 10) : null;
    const skip = (page - 1) * limit;

    if (page < 1 || limit < 1) {
      return new NextResponse('Invalid page or limit', { status: 400 });
    }

    await connect();

    // Build filter conditions
    const baseFilter = { is_delete: 0 };
    const statusFilter = status !== null ? { status: status } : {};
    const searchFilter = {
      $or: [{ name: { $regex: search, $options: 'i' } }, { sector: { $regex: search, $options: 'i' } }, { color: { $regex: search, $options: 'i' } }],
    };

    const finalFilter = {
      $and: [baseFilter, statusFilter, searchFilter],
    };

    const total_data = await User.countDocuments(finalFilter);

    const dataRaw = await User.find(finalFilter).skip(skip).limit(limit).populate('institution_id', 'name').lean();

    // Map institution_id to string and add institution_name
    const data = dataRaw.map((user: any) => {
      let institution_id = '';
      let institution_name = '';
      if (user.institution_id && typeof user.institution_id === 'object') {
        institution_id = user.institution_id._id?.toString() || '';
        institution_name = user.institution_id.name || '';
      } else if (typeof user.institution_id === 'string') {
        institution_id = user.institution_id;
      }
      return {
        ...user,
        institution_id,
        institution_name,
      };
    });

    return new NextResponse(
      JSON.stringify({
        data,
        pagination: {
          total_data: total_data,
          page,
          limit,
          total_pages: Math.ceil(total_data / limit),
        },
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error fetching users:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
};

export const POST = async (req: Request) => {
  try {
    // Connect to the database
    await connect();

    // Parse the request body
    const body = await req.json();
    const { name, email, password, role, institution_id } = body;

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
    const newUser = new User({ name, email, password: hashedPassword, role, institution_id, status: 1 });
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
