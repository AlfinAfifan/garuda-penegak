import connect from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import Institution from '@/lib/modals/institution';

export const GET = async (req: NextRequest) => {
  try {
    await connect();
    const data = await Institution.find({ is_delete: 0 }).lean();
    return new NextResponse(JSON.stringify({ data }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error exporting institution data:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
};
