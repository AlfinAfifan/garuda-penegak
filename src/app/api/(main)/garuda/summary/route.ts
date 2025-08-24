import connect from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import Garuda from '@/lib/modals/garuda';
import { getToken } from 'next-auth/jwt';
import { Types } from 'mongoose';

export const GET = async (req: NextRequest) => {
  try {
    await connect();

    // Get token from request
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Build aggregation pipeline untuk konsistensi dengan list API
    const baseMatch = { is_delete: 0 };

    const pipeline: any[] = [
      { $match: baseMatch },
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
    ];

    // If not admin or super_admin, filter by user's institution
    if (token.role !== 'admin' && token.role !== 'super_admin') {
      pipeline.push({
        $match: {
          'member.institution_id': new Types.ObjectId(token.institution_id),
        },
      });
    }

    // Get total garuda
    const totalGarudaPipeline = [...pipeline, { $count: 'total' }];
    const totalGarudaResult = await Garuda.aggregate(totalGarudaPipeline);
    const totalGaruda = totalGarudaResult[0]?.total || 0;

    // Get total approved
    const approvedPipeline = [...pipeline, { $match: { status: 1 } }, { $count: 'total' }];
    const approvedResult = await Garuda.aggregate(approvedPipeline);
    const totalApproved = approvedResult[0]?.total || 0;

    // Get total pending
    const pendingPipeline = [...pipeline, { $match: { status: 0 } }, { $count: 'total' }];
    const pendingResult = await Garuda.aggregate(pendingPipeline);
    const totalPending = pendingResult[0]?.total || 0;

    // Get by level TKU
    const byLevelPipeline = [
      ...pipeline,
      {
        $group: {
          _id: '$level_tku',
          count: { $sum: 1 },
        },
      },
    ];
    const byLevel = await Garuda.aggregate(byLevelPipeline);

    return new NextResponse(
      JSON.stringify({
        total_garuda: totalGaruda,
        total_approved: totalApproved,
        total_pending: totalPending,
        by_level_tku: byLevel,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error fetching garuda summary:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
};
