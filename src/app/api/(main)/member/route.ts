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

    const total_data = await Member.countDocuments(filter);

    let dataRaw: any[];

    // Untuk admin_kecamatan, perlu join dengan institution dan filter berdasarkan sub_district
    if (token.role === 'admin_kecamatan' && token.sub_district) {
      dataRaw = await Member.find(filter)
        .skip(skip)
        .limit(limit)
        .populate({
          path: 'institution_id',
          select: 'name sub_district',
          match: { sub_district: token.sub_district, is_delete: 0 },
        })
        .lean();

      // Filter out members yang institution_id null (tidak match dengan sub_district)
      dataRaw = dataRaw.filter((item: any) => item.institution_id !== null);
    } else {
      dataRaw = await Member.find(filter).skip(skip).limit(limit).populate({ path: 'institution_id', select: 'name sub_district' }).lean();
    }

    // Map institution_id to string and add institution_name
    const data = dataRaw.map((item: any) => {
      let institution_id = '';
      let institution_name = '';
      let kwaran = '';
      if (item.institution_id && typeof item.institution_id === 'object') {
        institution_id = item.institution_id._id?.toString() || '';
        institution_name = item.institution_id.name || '';
        kwaran = item.institution_id.sub_district || '';
      } else if (typeof item.institution_id === 'string') {
        institution_id = item.institution_id;
      }
      return {
        ...item,
        institution_id,
        institution_name,
        kwaran,
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
      },
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
      village: village?.toLowerCase(),
      sub_district: sub_district?.toLowerCase(),
      district: district?.toLowerCase(),
      province: province?.toLowerCase(),
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
