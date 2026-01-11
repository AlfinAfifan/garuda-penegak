import connect from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import Institution from '@/lib/modals/institution';
import { getToken } from 'next-auth/jwt';

export const GET = async (req: NextRequest) => {
  try {
    await connect();

    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    // Filter berdasarkan role
    const filter: any = { is_delete: 0 };
    if (token && token.role === 'admin_kecamatan' && token.sub_district) {
      filter.sub_district = token.sub_district;
    }

    const data = await Institution.find(filter).lean();
    return new NextResponse(JSON.stringify({ data }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error exporting institution data:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
};
