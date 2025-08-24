import connect from '@/lib/db';
import TypeTkk from '@/lib/modals/type_tkk';
import { NextResponse } from 'next/server';

export const GET = async (req: Request) => {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const skip = (page - 1) * limit;

    if (page < 1 || limit < 1) {
      return new NextResponse('Invalid page or limit', { status: 400 });
    }

    await connect();

    const total_data = await TypeTkk.countDocuments({ is_delete: 0 });

    const data = await TypeTkk.find({
      $and: [{ is_delete: 0 }, { $or: [{ name: { $regex: search, $options: 'i' } }, { sector: { $regex: search, $options: 'i' } }, { color: { $regex: search, $options: 'i' } }] }],
    })
      .skip(skip)
      .limit(limit)
      .lean();

    // Response
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

export const POST = async (req: Request) => {
  try {
    await connect();

    const body = await req.json();
    const { name, sector, color } = body;

    const data = await TypeTkk.findOne({ name });

    if (data) {
      return new NextResponse('Type TKK already exists', { status: 400 });
    }

    const newData = new TypeTkk({ name, sector, color });
    await newData.save();

    return new NextResponse(JSON.stringify({ message: 'Type TKK created successfully', data: newData.toObject() }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Error creating Type TKK:', error);
    return new NextResponse('Internal Server Error' + error.message, { status: 500 });
  }
};
