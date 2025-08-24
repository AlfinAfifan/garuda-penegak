import connect from '@/lib/db';
import { NextResponse } from 'next/server';
import { Types } from 'mongoose';
import Tkk from '@/lib/modals/tkk';

export const GET = async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
  try {
    const { id } = await params;

    if (!Types.ObjectId.isValid(id)) {
      return new NextResponse('Invalid ID format', { status: 400 });
    }

    await connect();

    const pipeline = [
      { $match: { _id: new Types.ObjectId(id) } },
      {
        $lookup: {
          from: 'typetkks',
          localField: 'type_tkk_id',
          foreignField: '_id',
          as: 'type_tkk',
        },
      },
      { $unwind: '$type_tkk' },
      {
        $lookup: {
          from: 'members',
          localField: 'member_id',
          foreignField: '_id',
          as: 'member',
        },
      },
      { $unwind: '$member' },
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
          'member.phone': 1,
          'institution.name': 1,
          'institution._id': 1,
          'type_tkk._id': 1,
          'type_tkk.name': 1,
        },
      },
    ];

    const result = await Tkk.aggregate(pipeline);
    const data = result[0];

    if (!data) {
      return new NextResponse('TKK data not found', { status: 404 });
    }

    return new NextResponse(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching TKK data by ID:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
};

export const DELETE = async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
  try {
    const { id } = await params;

    if (!id || !Types.ObjectId.isValid(id)) {
      return new NextResponse('Invalid id', { status: 400 });
    }

    await connect();

    const existingData = await Tkk.findOne({ _id: id, is_delete: 0 });

    if (!existingData) {
      return new NextResponse('TKK data not found', { status: 404 });
    }

    if (existingData.utama) {
      return new NextResponse('Cannot delete Madya data when Utama is present', { status: 400 });
    }

    const deletedData = await Tkk.findByIdAndUpdate(
      id,
      {
        madya: false,
        sk_madya: '',
        date_madya: null,
        examiner_name_madya: '',
        examiner_position_madya: '',
        examiner_address_madya: '',
      },
      { new: true }
    );

    if (!deletedData) {
      return new NextResponse('Failed to update TKK data', { status: 500 });
    }

    return new NextResponse(
      JSON.stringify({
        message: 'Madya data deleted successfully',
        data: deletedData,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error deleting TKK data:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
};
