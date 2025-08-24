import connect from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import Member from '@/lib/modals/member';
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
      matchStage = { institution_id: new Types.ObjectId(institution_id) };
    }

    const pipeline = [
      // Filter data yang tidak terhapus dari awal
      { $match: { is_delete: 0 } },
      ...(Object.keys(matchStage).length > 0 ? [{ $match: matchStage }] : []),
      {
        $lookup: {
          from: 'institutions',
          localField: 'institution_id',
          foreignField: '_id',
          as: 'institution',
        },
      },
      { $unwind: { path: '$institution', preserveNullAndEmptyArrays: true } },
      // Filter institution yang tidak terhapus
      { $match: { 'institution.is_delete': 0 } },
      {
        $project: {
          _id: 1,
          name: 1,
          phone: 1,
          institution_id: 1,
          institution_name: '$institution.name',
          member_number: 1,
          parent_number: 1,
          gender: 1,
          birth_place: 1,
          birth_date: 1,
          religion: 1,
          nationality: 1,
          rt: 1,
          rw: 1,
          village: 1,
          sub_district: 1,
          district: 1,
          province: 1,
          talent: 1,
          father_name: 1,
          father_birth_place: 1,
          father_birth_date: 1,
          mother_name: 1,
          mother_birth_place: 1,
          mother_birth_date: 1,
          parent_address: 1,
          parent_phone: 1,
          entry_date: 1,
          entry_level: 1,
          exit_date: 1,
          exit_reason: 1,
          createdAt: 1,
          updatedAt: 1,
        },
      },
    ];

    const data = await Member.aggregate(pipeline);

    return new NextResponse(JSON.stringify({ data }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error exporting member data:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
};
