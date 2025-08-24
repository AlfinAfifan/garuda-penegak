import connect from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import '@/lib/modals/institution';
import '@/lib/modals/member';
import Tkk from '@/lib/modals/tkk';
import { getToken } from 'next-auth/jwt';
import { Types } from 'mongoose';
import moment from 'moment';

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

    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    // Filter awal hanya untuk utama
    const initialMatchStage: any = { madya: true };

    const pipeline = [
      // Lookup member terlebih dahulu
      {
        $lookup: {
          from: 'members',
          localField: 'member_id',
          foreignField: '_id',
          as: 'member',
        },
      },
      { $unwind: '$member' },

      // PINDAHKAN match stage ke sini, setelah $lookup dan $unwind
      { $match: initialMatchStage },

      // Filter berdasarkan institution_id setelah member sudah di-lookup
      ...(token && token.role === 'user' && token.institution_id
        ? [
            {
              $match: {
                'member.institution_id': new Types.ObjectId(token.institution_id),
              },
            },
          ]
        : []),

      // Lookup type_tkk
      {
        $lookup: {
          from: 'typetkks',
          localField: 'type_tkk_id',
          foreignField: '_id',
          as: 'type_tkk',
        },
      },
      { $unwind: '$type_tkk' },

      // Filter search setelah semua lookup selesai
      ...(search
        ? [
            {
              $match: {
                $or: [{ 'member.name': { $regex: search, $options: 'i' } }, { 'member.phone': { $regex: search, $options: 'i' } }],
              },
            },
          ]
        : []),

      // Lookup institution
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
                sk_madya: 1,
                member_id: 1,
                purwa: 1,
                madya: 1,
                utama: 1,
                date_purwa: 1,
                date_madya: 1,
                date_utama: 1,
                examiner_name_madya: 1,
                examiner_position_madya: 1,
                examiner_address_madya: 1,
                createdAt: 1,
                updatedAt: 1,
                'member.name': 1,
                'member.member_number': 1,
                'member.phone': 1,
                'institution.name': 1,
                'institution._id': 1,
                'type_tkk._id': 1,
                'type_tkk.name': 1,
              },
            },
          ],
          totalCount: [{ $count: 'count' }],
        },
      },
    ];

    const result = await Tkk.aggregate(pipeline);

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
    console.error('Error fetching data:', error);

    return new NextResponse('Internal Server Error', { status: 500 });
  }
};

export const POST = async (req: Request) => {
  try {
    await connect();

    const body = await req.json();
    const { id, examiner_name_madya, examiner_position_madya, examiner_address_madya } = body;

    const existingData = await Tkk.findById(id).populate({ path: 'member_id', populate: { path: 'institution_id' } });

    if (!existingData) {
      return new NextResponse('Data not found', { status: 404 });
    }
    if (existingData.madya) {
      return new NextResponse('Madya data already exists', { status: 400 });
    }
    if (!existingData.purwa) {
      return new NextResponse('Purwa data must be completed before creating TKK', { status: 400 });
    }

    const now = moment();
    const datePurwa = existingData.date_purwa ? moment(existingData.date_purwa) : null;
    if (!datePurwa) {
      return new NextResponse('Tanggal Purwa tidak ditemukan', { status: 400 });
    }
    const diffDays = now.diff(datePurwa, 'days');
    if (diffDays < 30) {
      return new NextResponse('Jarak antara tanggal Purwa dan Madya minimal 30 hari', { status: 400 });
    }

    // Ambil nomor urut SK
    const lastTkk = await Tkk.findOne({ madya: true }, {}, { sort: { createdAt: -1 } });
    let nomorUrut = 1;
    if (lastTkk && lastTkk.sk_madya) {
      const match = lastTkk.sk_madya.match(/^(\d{5})/);
      if (match) {
        nomorUrut = parseInt(match[1], 10) + 1;
      }
    }
    const nomorUrutStr = nomorUrut.toString().padStart(5, '0');

    // Format SK: nomor_urut_5_digit/TKK-MADYA/gudep-A/tahun
    const tahun = new Date().getFullYear();
    let gudep = '';
    const member = existingData.member_id;
    const institution = member?.institution_id;
    if (member?.gender === 'Laki-Laki') {
      gudep = institution?.gudep_man || '';
    } else if (member?.gender === 'Perempuan') {
      gudep = institution?.gudep_woman || '';
    } else {
      gudep = institution?.gudep_man || '';
    }
    const sk_madya = `${nomorUrutStr}/TKK-MADYA/${gudep}-A/${tahun}`;
    const date_madya = new Date().toISOString().split('T')[0];

    const updatedData = await Tkk.findByIdAndUpdate(id, { sk_madya, date_madya, madya: true, examiner_name_madya, examiner_position_madya, examiner_address_madya }, { new: true });

    return new NextResponse(JSON.stringify({ message: 'Data created successfully', data: updatedData.toObject() }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Error creating data:', error);
    return new NextResponse('Internal Server Error' + error.message, { status: 500 });
  }
};
