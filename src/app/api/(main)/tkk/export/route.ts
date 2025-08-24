import connect from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import Tkk from '@/lib/modals/tkk';
import { Types } from 'mongoose';

export const GET = async (req: NextRequest) => {
  try {
    await connect();
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    const institution_id = token?.institution_id;

    // Build match stage
    let matchStage = {};
    if (!(token && (token.role === 'super_admin' || token.role === 'admin'))) {
      if (!institution_id) {
        return new NextResponse('institution_id is required', { status: 400 });
      }
      matchStage = { 'member.institution_id': new Types.ObjectId(institution_id) };
    }

    const pipeline = [
      // Filter data yang tidak terhapus dari awal
      { $match: { is_delete: 0 } },
      {
        $lookup: {
          from: 'members',
          localField: 'member_id',
          foreignField: '_id',
          as: 'member',
        },
      },
      { $unwind: '$member' },
      // Filter member yang tidak terhapus
      { $match: { 'member.is_delete': 0 } },
      {
        $lookup: {
          from: 'institutions',
          localField: 'member.institution_id',
          foreignField: '_id',
          as: 'institution',
        },
      },
      { $unwind: { path: '$institution', preserveNullAndEmptyArrays: true } },
      // Filter institution yang tidak terhapus
      { $match: { 'institution.is_delete': 0 } },
      ...(Object.keys(matchStage).length > 0 ? [{ $match: matchStage }] : []),
      {
        $project: {
          _id: 1,
          member_name: '$member.name',
          member_number: '$member.member_number',
          institution_name: '$institution.name',
          institution_id: '$institution._id',
          type_tkk_id: 1,
          sk_purwa: 1,
          sk_madya: 1,
          sk_utama: 1,
          purwa: 1,
          madya: 1,
          utama: 1,
          date_purwa: 1,
          date_madya: 1,
          date_utama: 1,
          examiner_name_purwa: 1,
          examiner_position_purwa: 1,
          examiner_address_purwa: 1,
          examiner_name_madya: 1,
          examiner_position_madya: 1,
          examiner_address_madya: 1,
          examiner_name_utama: 1,
          examiner_position_utama: 1,
          examiner_address_utama: 1,
          createdAt: 1,
          updatedAt: 1,
        },
      },
    ];

    const data = await Tkk.aggregate(pipeline);

    return new NextResponse(JSON.stringify({ data }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error exporting TKK data:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
};
