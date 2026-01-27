import connect from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import Institution from '@/lib/modals/institution';
import ActivityLog from '@/lib/modals/logs';
import { getToken } from 'next-auth/jwt';

export const GET = async (request: NextRequest) => {
  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const skip = (page - 1) * limit;

    if (page < -1 || (page < 1 && page !== -1) || limit < 1) {
      return new NextResponse('Invalid page or limit', { status: 400 });
    }

    await connect();

    // Build filter based on role
    let baseFilter: any = {
      $and: [{ is_delete: 0 }, { $or: [{ name: { $regex: search, $options: 'i' } }, { address: { $regex: search, $options: 'i' } }] }],
    };

    // Filter untuk admin_kecamatan: hanya tampilkan lembaga dengan sub_district yang sama
    if (token && token.role === 'admin_kecamatan' && token.sub_district) {
      baseFilter = {
        $and: [{ is_delete: 0 }, { sub_district: token.sub_district }, { $or: [{ name: { $regex: search, $options: 'i' } }, { address: { $regex: search, $options: 'i' } }] }],
      };
    }

    const total_data = await Institution.countDocuments(baseFilter);

    // Jika page = -1, return semua data tanpa pagination
    if (page === -1) {
      const data = await Institution.find(baseFilter).lean();

      return new NextResponse(
        JSON.stringify({
          data,
          pagination: {
            total_data,
            page: -1,
            limit: total_data,
            total_pages: 1,
          },
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        },
      );
    }

    const data = await Institution.find(baseFilter).skip(skip).limit(limit).lean();

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
      },
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
