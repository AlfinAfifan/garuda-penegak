import connect from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { Types } from 'mongoose';
import Garuda from '@/lib/modals/garuda';
import { getToken } from 'next-auth/jwt';
import ActivityLog from '@/lib/modals/logs';
import Member from '@/lib/modals/member';

export const GET = async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token) {
      return new NextResponse('Unauthorized', { status: 401 });
    }
    const { id } = await params;
    if (!id || !Types.ObjectId.isValid(id)) {
      return new NextResponse('Invalid Garuda ID', { status: 400 });
    }
    await connect();
    const garuda = await Garuda.findOne({ _id: id, is_delete: 0 }).populate({ path: 'member_id', select: 'name nta', model: Member }).lean();
    if (!garuda) {
      return new NextResponse('Garuda not found', { status: 404 });
    }
    return new NextResponse(JSON.stringify(garuda), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching Garuda:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
};

export const PATCH = async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token) {
      return new NextResponse('Unauthorized', { status: 401 });
    }
    // Validasi hanya admin & super_admin yang boleh mengubah status
    if (token.role !== 'super_admin') {
      return new NextResponse(JSON.stringify({ message: 'Hanya admin yang dapat mengubah status Garuda.' }), { status: 403, headers: { 'Content-Type': 'application/json' } });
    }

    const user_id = token.id;
    const { id } = await params;
    if (!id || !Types.ObjectId.isValid(id)) {
      return new NextResponse('Invalid Garuda ID', { status: 400 });
    }
    await connect();
    const updatedGaruda = await Garuda.findByIdAndUpdate(id, { status: 1, approved_by: token.name }, { new: true, runValidators: true }).populate({ path: 'member_id', select: 'name nta', model: Member });
    if (!updatedGaruda) {
      return new NextResponse('Garuda not found', { status: 404 });
    }
    await ActivityLog.create({
      user_id: user_id,
      action: 'update',
      description: `Mengupdate data Garuda untuk ${updatedGaruda.member_id?.name || ''}`,
      module: 'Garuda',
    });
    return new NextResponse(JSON.stringify(updatedGaruda), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error updating Garuda:', error);
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
      return new NextResponse('Invalid Garuda ID', { status: 400 });
    }
    await connect();

    // Ambil data Garuda terlebih dahulu untuk cek status
    const garuda = await Garuda.findOne({ _id: id, is_delete: 0 }).populate({ path: 'member_id', select: 'name nta', model: Member });
    if (!garuda) {
      return new NextResponse('Garuda not found', { status: 404 });
    }
    if (garuda.status === 1) {
      return new NextResponse(JSON.stringify({ message: 'Data Garuda yang sudah di-approve tidak bisa dihapus.' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    const deletedGaruda = await Garuda.findByIdAndUpdate(id, { is_delete: 1 }, { new: true }).populate({ path: 'member_id', select: 'name nta', model: Member });

    if (!deletedGaruda) {
      return new NextResponse('Garuda not found', { status: 404 });
    }

    await ActivityLog.create({
      user_id: user_id,
      action: 'delete',
      description: `Menghapus data Garuda untuk ${deletedGaruda.member_id?.name || ''}`,
      module: 'Garuda',
    });

    return new NextResponse(JSON.stringify({ message: 'Garuda deleted successfully' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error deleting Garuda:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
};
