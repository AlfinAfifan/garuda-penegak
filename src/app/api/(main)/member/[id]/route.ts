import connect from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { Types } from 'mongoose';
import Member from '@/lib/modals/member';
import { getToken } from 'next-auth/jwt';
import ActivityLog from '@/lib/modals/logs';

export const GET = async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { id } = await params;

    if (!id || !Types.ObjectId.isValid(id)) {
      return new NextResponse('Invalid id', { status: 400 });
    }

    await connect();

    const data = await Member.findOne({ _id: id, is_delete: 0 }).populate({ path: 'institution_id', select: 'name' }).lean();

    if (!data) {
      return new NextResponse('Member not found', { status: 404 });
    }

    return new NextResponse(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching data:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
};

export const PATCH = async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const user_id = token.id;
    const { id } = await params;

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
      entry_level,
      exit_date,
      exit_reason,
    } = body;

    if (!id || !Types.ObjectId.isValid(id)) {
      return new NextResponse('Invalid id', { status: 400 });
    }

    await connect();

    const updatedData = await Member.findByIdAndUpdate(
      id,
      {
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
      },
      { new: true, runValidators: true }
    );

    if (!updatedData) {
      return new NextResponse('Member not found', { status: 404 });
    }

    await ActivityLog.create({
      user_id: user_id,
      action: 'update',
      description: `Mengupdate member dengan nama ${name}`,
      module: 'Member',
    });

    return new NextResponse(JSON.stringify(updatedData), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error updating data:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
};

export const DELETE = async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const user_id = token.id;
    const { id } = await params;

    if (!id || !Types.ObjectId.isValid(id)) {
      return new NextResponse('Invalid id', { status: 400 });
    }

    await connect();

    const deletedData = await Member.findByIdAndUpdate(id, { is_delete: 1 }, { new: true });

    if (!deletedData) {
      return new NextResponse('Member not found', { status: 404 });
    }

    await ActivityLog.create({
      user_id: user_id,
      action: 'delete',
      description: `Menghapus member dengan nama ${deletedData.name}`,
      module: 'Member',
    });

    return new NextResponse(JSON.stringify({ message: 'Member deleted successfully' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error deleting data:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
};
