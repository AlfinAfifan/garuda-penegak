import connect from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { Types } from 'mongoose';
import Tku from '@/lib/modals/tku';
import { getToken } from 'next-auth/jwt';

export const GET = async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
  try {
    const { id } = await params;

    if (!Types.ObjectId.isValid(id)) {
      return new NextResponse('Invalid ID format', { status: 400 });
    }

    await connect();

    const pipeline = [
      { $match: { _id: new Types.ObjectId(id), is_delete: 0 } },
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
          'member.phone': 1,
          'institution.name': 1,
          'institution._id': 1,
        },
      },
    ];

    const result = await Tku.aggregate(pipeline);
    const data = result[0];

    if (!data) {
      return new NextResponse('Data not found', { status: 404 });
    }

    return new NextResponse(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching data by ID:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
};

export const DELETE = async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  try {
    // Check authorization
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token) {
      return new NextResponse('Unauthorized', { status: 401 });
    }
    // admin_kecamatan tidak boleh delete TKU
    if (token.role === 'admin_kecamatan') {
      return new NextResponse(JSON.stringify({ message: 'Anda tidak memiliki akses untuk menghapus data TKU.' }), { status: 403, headers: { 'Content-Type': 'application/json' } });
    }

    const { id } = await params;

    if (!id || !Types.ObjectId.isValid(id)) {
      return new NextResponse('Invalid id', { status: 400 });
    }

    await connect();

    const existingData = await Tku.findOne({ _id: id, is_delete: 0 });
    if (!existingData) {
      return new NextResponse('Data not found', { status: 404 });
    }

    const deletedData = await Tku.findByIdAndUpdate(id, { laksana: false, sk_laksana: '', date_laksana: null });

    if (!deletedData) {
      return new NextResponse('Data not found', { status: 404 });
    }

    return new NextResponse(JSON.stringify({ message: 'Data deleted successfully' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error deleting data:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
};
