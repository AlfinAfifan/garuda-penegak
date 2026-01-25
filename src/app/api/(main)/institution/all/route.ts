import connect from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import Institution from '@/lib/modals/institution';

export const GET = async (request: NextRequest) => {
  try {

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
    const baseFilter: any = {
      $and: [{ is_delete: 0 }, { $or: [{ name: { $regex: search, $options: 'i' } }, { address: { $regex: search, $options: 'i' } }] }],
    };

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
