import connect from '@/lib/db';
import { NextResponse } from 'next/server';
import Member from '@/lib/modals/member';
import Institution from '@/lib/modals/institution';
import Tku from '@/lib/modals/tku';
import Tkk from '@/lib/modals/tkk';
import ActivityLog from '@/lib/modals/logs';
import User from '@/lib/modals/user';
import Garuda from '@/lib/modals/garuda';
import '@/lib/modals/user';
import { getToken } from 'next-auth/jwt';
import mongoose from 'mongoose';

import { NextRequest } from 'next/server';
export const GET = async (req: NextRequest) => {
  try {
    await connect();
    // Get token from request
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    let memberFilter = {};
    let institutionFilter = {};
    let logFilter = {};

    if (token.role === 'user' && token.institution_id) {
      memberFilter = { institution_id: token.institution_id, is_delete: 0 };
      institutionFilter = { _id: token.institution_id, is_delete: 0 };
      logFilter = { institution_id: token.institution_id, is_delete: 0 };
    } else {
      memberFilter = { is_delete: 0 };
      institutionFilter = { is_delete: 0 };
      logFilter = { is_delete: 0 };
    }

    // Count members
    const totalMember = await Member.countDocuments(memberFilter);
    // Count institutions
    const totalInstitution = await Institution.countDocuments(institutionFilter);

    // Count Tku
    let totalTku = 0;
    if (token.role === 'user' && token.institution_id) {
      // Count Tku by member institution_id using aggregation
      const institutionObjectId = new mongoose.Types.ObjectId(token.institution_id);
      const tkuCount = await Tku.aggregate([
        {
          $lookup: {
            from: 'members',
            localField: 'member_id',
            foreignField: '_id',
            as: 'member',
          },
        },
        {
          $match: {
            'member.institution_id': institutionObjectId,
            is_delete: 0,
          },
        },
        {
          $count: 'total',
        },
      ]);
      totalTku = tkuCount.length > 0 ? tkuCount[0].total : 0;
    } else {
      totalTku = await Tku.countDocuments({ is_delete: 0 });
    }

    // Count Tkk
    let totalTkk = 0;
    if (token.role === 'user' && token.institution_id) {
      // Count Tkk by member institution_id using aggregation
      const institutionObjectId = new mongoose.Types.ObjectId(token.institution_id);
      const tkkCount = await Tkk.aggregate([
        {
          $lookup: {
            from: 'members',
            localField: 'member_id',
            foreignField: '_id',
            as: 'member',
          },
        },
        {
          $match: {
            'member.institution_id': institutionObjectId,
            is_delete: 0,
          },
        },
        {
          $count: 'total',
        },
      ]);
      totalTkk = tkkCount.length > 0 ? tkkCount[0].total : 0;
    } else {
      totalTkk = await Tkk.countDocuments({ is_delete: 0 });
    }

    // Get last logs
    const lastLogs = await ActivityLog.find(logFilter).sort({ createdAt: -1 }).limit(10).populate('user_id', 'name email').lean();

    // Get detail TKU data (bantara, laksana)
    const detailTku = { bantara: 0, laksana: 0 };
    if (token.role === 'user' && token.institution_id) {
      const institutionObjectId = new mongoose.Types.ObjectId(token.institution_id);

      // Count TKU Bantara
      const tkuBantaraCount = await Tku.aggregate([
        {
          $lookup: {
            from: 'members',
            localField: 'member_id',
            foreignField: '_id',
            as: 'member',
          },
        },
        {
          $match: {
            'member.institution_id': institutionObjectId,
            bantara: true,
            is_delete: 0,
          },
        },
        { $count: 'total' },
      ]);
      detailTku.bantara = tkuBantaraCount.length > 0 ? tkuBantaraCount[0].total : 0;

      // Count TKU Laksana
      const tkuLaksanaCount = await Tku.aggregate([
        {
          $lookup: {
            from: 'members',
            localField: 'member_id',
            foreignField: '_id',
            as: 'member',
          },
        },
        {
          $match: {
            'member.institution_id': institutionObjectId,
            laksana: true,
            is_delete: 0,
          },
        },
        { $count: 'total' },
      ]);
      detailTku.laksana = tkuLaksanaCount.length > 0 ? tkuLaksanaCount[0].total : 0;

      
    } else {
      // Admin view - count all
      detailTku.bantara = await Tku.countDocuments({ bantara: true, is_delete: 0 });
      detailTku.laksana = await Tku.countDocuments({ laksana: true, is_delete: 0 });
    }

    // Get detail TKK data (purwa, madya, utama)
    const detailTkk = { purwa: 0, madya: 0, utama: 0 };
    if (token.role === 'user' && token.institution_id) {
      const institutionObjectId = new mongoose.Types.ObjectId(token.institution_id);

      // Count TKK Purwa
      const tkkPurwaCount = await Tkk.aggregate([
        {
          $lookup: {
            from: 'members',
            localField: 'member_id',
            foreignField: '_id',
            as: 'member',
          },
        },
        {
          $match: {
            'member.institution_id': institutionObjectId,
            purwa: true,
            is_delete: 0,
          },
        },
        { $count: 'total' },
      ]);
      detailTkk.purwa = tkkPurwaCount.length > 0 ? tkkPurwaCount[0].total : 0;

      // Count TKK Madya
      const tkkMadyaCount = await Tkk.aggregate([
        {
          $lookup: {
            from: 'members',
            localField: 'member_id',
            foreignField: '_id',
            as: 'member',
          },
        },
        {
          $match: {
            'member.institution_id': institutionObjectId,
            madya: true,
            is_delete: 0,
          },
        },
        { $count: 'total' },
      ]);
      detailTkk.madya = tkkMadyaCount.length > 0 ? tkkMadyaCount[0].total : 0;

      // Count TKK Utama
      const tkkUtamaCount = await Tkk.aggregate([
        {
          $lookup: {
            from: 'members',
            localField: 'member_id',
            foreignField: '_id',
            as: 'member',
          },
        },
        {
          $match: {
            'member.institution_id': institutionObjectId,
            utama: true,
            is_delete: 0,
          },
        },
        { $count: 'total' },
      ]);
      detailTkk.utama = tkkUtamaCount.length > 0 ? tkkUtamaCount[0].total : 0;
    } else {
      // Admin view - count all
      detailTkk.purwa = await Tkk.countDocuments({ purwa: true, is_delete: 0 });
      detailTkk.madya = await Tkk.countDocuments({ madya: true, is_delete: 0 });
      detailTkk.utama = await Tkk.countDocuments({ utama: true, is_delete: 0 });
    }

    // Get Garuda data (pending and approved)
    const garudaData = { pending: 0, approved: 0 };
    if (token.role === 'user' && token.institution_id) {
      const institutionObjectId = new mongoose.Types.ObjectId(token.institution_id);

      // Count Garuda Pending
      const garudaPendingCount = await Garuda.aggregate([
        {
          $lookup: {
            from: 'members',
            localField: 'member_id',
            foreignField: '_id',
            as: 'member',
          },
        },
        {
          $match: {
            'member.institution_id': institutionObjectId,
            status: 0,
            is_delete: 0,
          },
        },
        { $count: 'total' },
      ]);
      garudaData.pending = garudaPendingCount.length > 0 ? garudaPendingCount[0].total : 0;

      // Count Garuda Approved
      const garudaApprovedCount = await Garuda.aggregate([
        {
          $lookup: {
            from: 'members',
            localField: 'member_id',
            foreignField: '_id',
            as: 'member',
          },
        },
        {
          $match: {
            'member.institution_id': institutionObjectId,
            status: 1,
            is_delete: 0,
          },
        },
        { $count: 'total' },
      ]);
      garudaData.approved = garudaApprovedCount.length > 0 ? garudaApprovedCount[0].total : 0;
    } else {
      // Admin view - count all
      garudaData.pending = await Garuda.countDocuments({ status: 0, is_delete: 0 });
      garudaData.approved = await Garuda.countDocuments({ status: 1, is_delete: 0 });
    }

    // Get User data (active and inactive)
    const userData = { active: 0, inactive: 0 };
    if (token.role === 'user' && token.institution_id) {
      // For institution users, only count users from their institution
      userData.active = await User.countDocuments({
        institution_id: token.institution_id,
        status: 1,
        is_delete: 0,
      });
      userData.inactive = await User.countDocuments({
        institution_id: token.institution_id,
        status: 0,
        is_delete: 0,
      });
    } else {
      // Admin view - count all users
      userData.active = await User.countDocuments({ status: 1, is_delete: 0 });
      userData.inactive = await User.countDocuments({ status: 0, is_delete: 0 });
    }

    // Get monthly member registrations (from January to December of current year)
    const currentYear = new Date().getFullYear();
    const months = [];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    for (let i = 0; i < 12; i++) {
      const start = new Date(currentYear, i, 1);
      const end = new Date(currentYear, i + 1, 0, 23, 59, 59, 999);
      months.push({
        month: monthNames[i],
        start,
        end,
      });
    }

    const monthlyMemberData: { [key: string]: number } = {};
    for (const monthInfo of months) {
      let monthlyCount = 0;
      if (token.role === 'user' && token.institution_id) {
        monthlyCount = await Member.countDocuments({
          institution_id: token.institution_id,
          is_delete: 0,
          createdAt: {
            $gte: monthInfo.start,
            $lte: monthInfo.end,
          },
        });
      } else {
        monthlyCount = await Member.countDocuments({
          is_delete: 0,
          createdAt: {
            $gte: monthInfo.start,
            $lte: monthInfo.end,
          },
        });
      }
      monthlyMemberData[monthInfo.month] = monthlyCount;
    }

    return NextResponse.json(
      {
        total_member: totalMember,
        total_institution: totalInstitution,
        total_tku: totalTku,
        total_tkk: totalTkk,
        detail_tku: detailTku,
        detail_tkk: detailTkk,
        garuda: garudaData,
        user: userData,
        monthly_members: monthlyMemberData,
        last_logs: lastLogs,
      },
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
};
