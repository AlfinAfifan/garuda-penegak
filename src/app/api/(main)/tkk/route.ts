import connect from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import Tkk from '@/lib/modals/tkk';
import { getToken } from 'next-auth/jwt';
import Member from '@/lib/modals/member';
import { Types } from 'mongoose';

export const GET = async (req: NextRequest) => {
  try {
    await connect();

    // Ambil token user
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    let baseFilter: any = {};

    // Jika user role dan ada institution_id, dapatkan member_ids yang sesuai
    if (token && token.role === 'user' && token.institution_id) {
      const members = await Member.find({ institution_id: new Types.ObjectId(token.institution_id), is_delete: 0 }, { _id: 1 });
      const memberIds = members.map((member) => member._id);

      // Jika tidak ada member yang ditemukan, return data kosong
      if (memberIds.length === 0) {
        return NextResponse.json({
          total_purwa: 0,
          total_madya: 0,
          total_utama: 0,
        });
      }

      // Filter berdasarkan member_id yang ada di institution tersebut
      baseFilter = { member_id: { $in: memberIds }, is_delete: 0 };
    } else {
      baseFilter = { is_delete: 0 };
    }

    // Count dengan filter yang sesuai
    const [totalPurwa, totalMadya, totalUtama] = await Promise.all([Tkk.countDocuments({ ...baseFilter, purwa: true }), Tkk.countDocuments({ ...baseFilter, madya: true }), Tkk.countDocuments({ ...baseFilter, utama: true })]);

    const result = {
      total_purwa: totalPurwa,
      total_madya: totalMadya,
      total_utama: totalUtama,
    };

    return NextResponse.json(result, {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('❌ Error fetching TKK data:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
};
