import connect from '@/lib/db';
import Tku from '@/lib/modals/tku';
import { NextRequest, NextResponse } from 'next/server';
import '@/lib/modals/institution';
import '@/lib/modals/member';
import { getToken } from 'next-auth/jwt';
import { Types } from 'mongoose';
import Member from '@/lib/modals/member';

export const GET = async (req: NextRequest) => {
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

    // Ambil token user
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    // Filter awal hanya untuk bantara
    const initialMatchStage: any = { bantara: true, is_delete: 0 };

    const pipeline = [
      { $match: initialMatchStage },
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

      ...(token && token.role === 'user' && token.institution_id
        ? [
            {
              $match: {
                'member.institution_id': new Types.ObjectId(token.institution_id),
              },
            },
          ]
        : []),

      ...(search
        ? [
            {
              $match: {
                $or: [{ 'member.name': { $regex: search, $options: 'i' } }, { 'member.phone': { $regex: search, $options: 'i' } }],
              },
            },
          ]
        : []),

      {
        $lookup: {
          from: 'institutions',
          localField: 'member.institution_id',
          foreignField: '_id',
          as: 'institution',
        },
      },
      { $unwind: { path: '$institution', preserveNullAndEmptyArrays: true } },

      {
        $facet: {
          data: [
            { $skip: skip },
            { $limit: limit },
            {
              $project: {
                _id: 1,
                member_id: 1,
                bantara: 1,
                laksana: 1,
                sk_bantara: 1,
                sk_laksana: 1,
                date_bantara: 1,
                date_laksana: 1,
                createdAt: 1,
                updatedAt: 1,
                'member.name': 1,
                'member.member_number': 1,
                'member.phone': 1,
                'institution.name': 1,
                'institution._id': 1,
              },
            },
          ],
          totalCount: [{ $count: 'count' }],
        },
      },
    ];

    const result = await Tku.aggregate(pipeline);

    const data = result[0]?.data || [];
    const totalCountArray = result[0]?.totalCount || [];
    const total_data = totalCountArray.length > 0 ? totalCountArray[0].count : 0;

    const responsePayload = {
      data,
      pagination: {
        total_data,
        page,
        limit,
        total_pages: Math.ceil(total_data / limit),
      },
    };

    return new NextResponse(JSON.stringify(responsePayload), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('❌ Error fetching data:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
};

export const POST = async (req: Request) => {
  try {
    await connect();

    const body = await req.json();
    const { member_id } = body;

    // Ambil data member dan institution
    let member = await Member.findOne({ _id: member_id, is_delete: 0 }).populate('institution_id').lean();
    if (Array.isArray(member)) member = member[0];
    if (!member) {
      return new NextResponse('Member not found', { status: 404 });
    }
    const institution = member.institution_id;
    if (!institution) {
      return new NextResponse('Institution not found', { status: 404 });
    }

    // Ambil nomor urut SK
    const lastTku = await Tku.findOne({}, {}, { sort: { createdAt: -1 } });
    let nomorUrut = 1;
    if (lastTku && lastTku.sk_bantara) {
      const match = lastTku.sk_bantara.match(/^(\d{5})/);
      if (match) {
        nomorUrut = parseInt(match[1], 10) + 1;
      }
    }
    const nomorUrutStr = nomorUrut.toString().padStart(5, '0');

    // Format SK: nomor_urut_5_digit/TKU-BANTARA/gudep_man-A/tahun
    const tahun = new Date().getFullYear();
    let gudep = '';
    if (member.gender === 'Laki-Laki') {
      gudep = institution.gudep_man || '';
    } else if (member.gender === 'Perempuan') {
      gudep = institution.gudep_woman || '';
    } else {
      gudep = institution.gudep_man || '';
    }
    const sk_bantara = `${nomorUrutStr}/TKU-BANTARA/${gudep}-A/${tahun}`;
    const date_bantara = new Date().toISOString().split('T')[0];

    const newData = new Tku({ member_id, sk_bantara, date_bantara, bantara: true });
    await newData.save();

    return new NextResponse(JSON.stringify({ message: 'Data created successfully', data: newData.toObject() }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Error creating data:', error);
    return new NextResponse('Internal Server Error' + error.message, { status: 500 });
  }
};
