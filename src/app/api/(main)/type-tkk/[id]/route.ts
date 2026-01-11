import connect from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { Types } from 'mongoose';
import TypeTkk from '@/lib/modals/type_tkk';
import { getToken } from 'next-auth/jwt';

export const GET = async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
  try {
    const { id } = await params;

    if (!id || !Types.ObjectId.isValid(id)) {
      return new NextResponse('Invalid id', { status: 400 });
    }

    await connect();

    const data = await TypeTkk.findOne({ _id: id, is_delete: 0 }).lean();

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
    // Check authorization
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token) {
      return new NextResponse('Unauthorized', { status: 401 });
    }
    // admin_kecamatan tidak boleh update type-tkk
    if (token.role === 'admin_kecamatan') {
      return new NextResponse(JSON.stringify({ message: 'Anda tidak memiliki akses untuk mengubah data Jenis TKK.' }), { status: 403, headers: { 'Content-Type': 'application/json' } });
    }

    const { id } = await params;

    const body = await req.json();
    const { name, sector, color } = body;

    if (!id || !Types.ObjectId.isValid(id)) {
      return new NextResponse('Invalid id', { status: 400 });
    }

    await connect();

    const updatedData = await TypeTkk.findByIdAndUpdate(id, { name, sector, color }, { new: true, runValidators: true });

    if (!updatedData) {
      return new NextResponse('Data not found', { status: 404 });
    }

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
    // Check authorization
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token) {
      return new NextResponse('Unauthorized', { status: 401 });
    }
    // admin_kecamatan tidak boleh delete type-tkk
    if (token.role === 'admin_kecamatan') {
      return new NextResponse(JSON.stringify({ message: 'Anda tidak memiliki akses untuk menghapus data Jenis TKK.' }), { status: 403, headers: { 'Content-Type': 'application/json' } });
    }

    const { id } = await params;

    if (!id || !Types.ObjectId.isValid(id)) {
      return new NextResponse('Invalid id', { status: 400 });
    }

    await connect();

    const deletedData = await TypeTkk.findByIdAndUpdate(id, { is_delete: 1 }, { new: true });

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
