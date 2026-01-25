import connect from '@/lib/db';
import Member from '@/lib/modals/member';
import { getToken } from 'next-auth/jwt';
import { NextRequest, NextResponse } from 'next/server';
import { Types } from 'mongoose';
import '@/lib/modals/institution';

export const GET = async (req: NextRequest) => {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const skip = (page - 1) * limit;

    if (page < 1 || limit < 1) {
      return new NextResponse('Invalid page or limit', { status: 400 });
    }

    await connect();

    // Build base filter untuk member
    let memberFilter: any = {
      $and: [
        { is_delete: 0 },
        {
          $or: [{ name: { $regex: search, $options: 'i' } }, { phone: { $regex: search, $options: 'i' } }],
        },
      ],
    };

    // Jika role user, filter by institution_id
    if (token.role === 'user' && token.institution_id) {
      memberFilter = {
        $and: [
          { institution_id: new Types.ObjectId(token.institution_id) },
          { is_delete: 0 },
          {
            $or: [{ name: { $regex: search, $options: 'i' } }, { phone: { $regex: search, $options: 'i' } }],
          },
        ],
      };
    }

    // Cari member yang tidak memiliki TKU atau semua TKU-nya false
    const membersWithoutTku = await Member.aggregate([
      { $match: memberFilter },
      {
        $lookup: {
          from: 'tkus',
          localField: '_id',
          foreignField: 'member_id',
          as: 'tku',
        },
      },
      {
        $match: {
          $or: [
            { tku: { $size: 0 } }, // Member tidak memiliki TKU sama sekali
            {
              $and: [
                // Tidak ada TKU yang dihapus DAN memiliki bantara/laksana true
                {
                  tku: {
                    $not: {
                      $elemMatch: {
                        is_delete: { $ne: 1 },
                        $or: [{ bantara: true }, { laksana: true }],
                      },
                    },
                  },
                },
              ],
            },
          ],
        },
      },
      {
        $lookup: {
          from: 'institutions',
          localField: 'institution_id',
          foreignField: '_id',
          as: 'institution',
        },
      },
      {
        $addFields: {
          institution_id: { $toString: '$institution_id' },
          institution_name: { $arrayElemAt: ['$institution.name', 0] },
          kwaran: { $arrayElemAt: ['$institution.sub_district', 0] },
        },
      },
      {
        $project: {
          tku: 0,
          institution: 0,
        },
      },
      { $sort: { createdAt: -1 } },
    ]);

    // Untuk admin_kecamatan, filter berdasarkan sub_district
    let filteredMembers = membersWithoutTku;
    if (token.role === 'admin_kecamatan' && token.sub_district) {
      filteredMembers = membersWithoutTku.filter((member: any) => member.kwaran === token.sub_district);
    }

    // Pagination manual karena menggunakan aggregation
    const total_data = filteredMembers.length;
    const data = filteredMembers.slice(skip, skip + limit);

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
      },
    );
  } catch (error) {
    console.error('Error fetching members without TKU:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
};
