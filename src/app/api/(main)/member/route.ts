import connect from '@/lib/db';
import ActivityLog from '@/lib/modals/logs';
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

    // Build filter
    let filter: any = {
      $and: [{ is_delete: 0 }, { $or: [{ name: { $regex: search, $options: 'i' } }, { phone: { $regex: search, $options: 'i' } }] }],
    };

    // Jika role user, filter by institution_id (harus ObjectId)
    if (token.role === 'user' && token.institution_id) {
      filter = {
        $and: [{ institution_id: new Types.ObjectId(token.institution_id) }, { is_delete: 0 }, { $or: [{ name: { $regex: search, $options: 'i' } }, { phone: { $regex: search, $options: 'i' } }] }],
      };
    }

    let total_data: number;
    let dataRaw: any[];

    // Jika role admin_kecamatan, filter by sub_district dari institution
    if (token.role === 'admin_kecamatan' && token.sub_district) {
      // Menggunakan aggregation pipeline untuk filter berdasarkan sub_district institution
      const pipeline = [
        { $match: { is_delete: 0 } },
        {
          $lookup: {
            from: 'institutions',
            localField: 'institution_id',
            foreignField: '_id',
            as: 'institution',
          },
        },
        { $unwind: { path: '$institution', preserveNullAndEmptyArrays: true } },
        {
          $match: {
            'institution.sub_district': token.sub_district,
            'institution.is_delete': 0,
            $or: [{ name: { $regex: search, $options: 'i' } }, { phone: { $regex: search, $options: 'i' } }],
          },
        },
      ];

      // Count total
      const countPipeline = [...pipeline, { $count: 'total' }];
      const countResult = await Member.aggregate(countPipeline);
      total_data = countResult[0]?.total || 0;

      // Get data with pagination
      const dataPipeline = [
        ...pipeline,
        { $skip: skip },
        { $limit: limit },
        {
          $project: {
            _id: 1,
            name: 1,
            phone: 1,
            institution_id: '$institution._id',
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
            is_delete: 1,
            createdAt: 1,
            updatedAt: 1,
          },
        },
      ];
      dataRaw = await Member.aggregate(dataPipeline);
    } else {
      total_data = await Member.countDocuments(filter);
      dataRaw = await Member.find(filter).skip(skip).limit(limit).populate({ path: 'institution_id', select: 'name' }).lean();
    }

    // Map institution_id to string and add institution_name
    const data = dataRaw.map((item: any) => {
      let institution_id = '';
      let institution_name = '';
      if (item.institution_id && typeof item.institution_id === 'object') {
        institution_id = item.institution_id._id?.toString() || '';
        institution_name = item.institution_id.name || '';
      } else if (typeof item.institution_id === 'string') {
        institution_id = item.institution_id;
      }
      return {
        ...item,
        institution_id,
        institution_name,
      };
    });

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

export const POST = async (req: NextRequest) => {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // admin_kecamatan tidak boleh create member
    if (token.role === 'admin_kecamatan') {
      return new NextResponse(JSON.stringify({ message: 'Anda tidak memiliki akses untuk menambah data anggota.' }), { status: 403, headers: { 'Content-Type': 'application/json' } });
    }

    const user_id = token.id;

    await connect();

    const body = await req.json();
    const {
      name,
      phone,
      institution_id,
      member_number,
      parent_number,
      gender,
      birth_place,
      birth_date,
      religion,
      nationality,
      rt,
      rw,
      village,
      sub_district,
      district,
      province,
      talent,
      father_name,
      father_birth_place,
      father_birth_date,
      mother_name,
      mother_birth_place,
      mother_birth_date,
      parent_address,
      parent_phone,
      entry_date,
      exit_date,
      entry_level,
      exit_reason,
    } = body;

    const data = await Member.findOne({ name });

    if (data) {
      return new NextResponse('Data already exists', { status: 400 });
    }

    const newData = new Member({
      name,
      phone,
      institution_id,
      member_number,
      parent_number,
      gender,
      birth_place,
      birth_date,
      religion,
      nationality,
      rt,
      rw,
      village,
      sub_district,
      district,
      province,
      talent,
      father_name,
      father_birth_place,
      father_birth_date,
      mother_name,
      mother_birth_place,
      mother_birth_date,
      parent_address,
      parent_phone,
      entry_date,
      entry_level,
      exit_date,
      exit_reason,
    });
    await newData.save();

    await ActivityLog.create({
      user_id: user_id,
      action: 'create',
      description: `Menambahkan member baru dengan nama ${name}`,
      module: 'Member',
    });

    return new NextResponse(JSON.stringify({ message: 'Data created successfully', data: newData.toObject() }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Error creating data:', error);
    return new NextResponse('Internal Server Error' + error.message, { status: 500 });
  }
};
