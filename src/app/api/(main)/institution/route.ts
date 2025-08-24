import connect from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import Institution from '@/lib/modals/institution';
import ActivityLog from '@/lib/modals/logs';
import User from '@/lib/modals/user';
import { getToken } from 'next-auth/jwt';

export const GET = async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const skip = (page - 1) * limit;

    if (page < 1 || limit < 1) {
      return new NextResponse('Invalid page or limit', { status: 400 });
    }

    await connect();

    const total_data = await Institution.countDocuments({ is_delete: 0 });

    const data = await Institution.find({
      $and: [{ is_delete: 0 }, { $or: [{ name: { $regex: search, $options: 'i' } }, { address: { $regex: search, $options: 'i' } }] }],
    })
      .skip(skip)
      .limit(limit)
      .lean();

    return new NextResponse(
      JSON.stringify({
        data,
        pagination: {
          total_data,
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
    console.error('Error fetching data:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
};

export const POST = async (req: NextRequest) => {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token) {
      return new NextResponse('Unauthorized', { status: 401 });
    }
    const user_id = token.id;

    // Connect to the database
    await connect();

    // Parse the request body
    const body = await req.json();
    const { name, sub_district, address, gudep_man, gudep_woman, head_gudep_man, head_gudep_woman, nta_head_gudep_man, nta_head_gudep_woman, headmaster_name, headmaster_number } = body;

    const existingInstitution = await Institution.findOne({ name });
    if (existingInstitution) {
      return new NextResponse('Institution already exists', { status: 400 });
    }

    // Create a new institution
    const newInstitution = new Institution({ name, sub_district, address, gudep_man, gudep_woman, head_gudep_man, head_gudep_woman, nta_head_gudep_man, nta_head_gudep_woman, headmaster_name, headmaster_number });
    await newInstitution.save();

    await ActivityLog.create({
      user_id: user_id,
      action: 'create',
      description: `Menambahkan institusi baru dengan nama ${name}`,
      module: 'Institution',
    });

    // Return the created institution
    return new NextResponse(JSON.stringify({ message: 'Institution created successfully', data: newInstitution.toObject() }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Error creating institution:', error);
    return new NextResponse('Internal Server Error' + error.message, { status: 500 });
  }
};
