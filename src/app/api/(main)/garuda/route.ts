import { NextRequest, NextResponse } from 'next/server';
import connect from '@/lib/db';
import Garuda from '@/lib/modals/garuda';
import Member from '@/lib/modals/member';
import ActivityLog from '@/lib/modals/logs';
import { getToken } from 'next-auth/jwt';
import Tkk from '@/lib/modals/tkk';
import Tku from '@/lib/modals/tku';
import TypeTkk from '@/lib/modals/type_tkk';
import { Types } from 'mongoose';

export async function GET(req: NextRequest) {
  await connect();
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '10', 10);
  const search = searchParams.get('search') || '';
  const institutionId = searchParams.get('institution_id') || '';

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  // Pipeline untuk aggregate agar bisa search by nama member
  const initialMatchStage: any = { is_delete: 0 };

  const pipeline: any[] = [
    { $match: initialMatchStage },
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

    // Lookup institution untuk filter admin_kecamatan by sub_district
    {
      $lookup: {
        from: 'institutions',
        localField: 'member.institution_id',
        foreignField: '_id',
        as: 'institution',
      },
    },
    { $unwind: { path: '$institution', preserveNullAndEmptyArrays: true } },

    // Filter institution yang tidak terhapus
    { $match: { 'institution.is_delete': 0 } },

    // Filter by sub_district untuk admin_kecamatan
    ...(token && token.role === 'admin_kecamatan' && token.sub_district
      ? [
          {
            $match: {
              'institution.sub_district': token.sub_district,
            },
          },
        ]
      : []),

    ...(token && token.role === 'user' && token.institution_id
      ? [
          {
            $match: {
              'member.institution_id': new Types.ObjectId(token.institution_id),
            },
          },
        ]
      : []),

    // Filter by lembaga (institution) dari anggota
    ...(institutionId && Types.ObjectId.isValid(institutionId)
      ? [
          {
            $match: {
              'member.institution_id': new Types.ObjectId(institutionId),
            },
          },
        ]
      : []),

    ...(search
      ? [
          {
            $match: {
              $or: [{ 'member.name': { $regex: search, $options: 'i' } }, { 'member.phone': { $regex: search, $options: 'i' } }, { 'institution.name': { $regex: search, $options: 'i' } }],
            },
          },
        ]
      : []),

    {
      $sort: { createdAt: -1 },
    },
    {
      $facet: {
        data: [
          { $skip: (page - 1) * limit },
          { $limit: limit },
          {
            $project: {
              _id: 1,
              member_id: {
                _id: '$member._id',
                name: '$member.name',
                nta: '$member.member_number',
              },
              institution_id: '$institution._id',
              institution_name: '$institution.name',
              institution_sub_district: '$institution.sub_district',
              level_tku: 1,
              total_purwa: 1,
              total_madya: 1,
              total_utama: 1,
              status: 1,
              approved_by: 1,
              approved_at: 1,
              certificate_number: 1,
              certificate_year: 1,
              createdAt: 1,
              updatedAt: 1,
            },
          },
        ],
        totalCount: [{ $count: 'count' }],
      },
    },
  ];

  const result = await Garuda.aggregate(pipeline);
  const data = result[0]?.data || [];
  const total = result[0]?.totalCount[0]?.count || 0;

  return NextResponse.json({
    data,
    pagination: {
      total,
      page,
      limit,
      total_pages: Math.ceil(total / limit),
    },
  });
}

export const POST = async (req: NextRequest) => {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // admin_kecamatan tidak boleh create garuda
    if (token.role === 'admin_kecamatan') {
      return new NextResponse(JSON.stringify({ message: 'Anda tidak memiliki akses untuk menambah data Garuda.' }), { status: 403, headers: { 'Content-Type': 'application/json' } });
    }

    const user_id = token.id;

    await connect();
    const body = await req.json();
    const { member_id } = body;

    // --- VALIDATION ---
    // Ambil data member
    let memberList = await Member.findOne({ _id: member_id, is_delete: 0 }).lean();
    if (Array.isArray(memberList)) memberList = memberList[0];
    if (!memberList) {
      return new NextResponse('Member not found', { status: 404 });
    }

    const tkks = await Tkk.find({ member_id: member_id, is_delete: 0 }).lean();
    const tku = await Tku.find({ member_id: member_id, is_delete: 0 }).lean();

    // Tentukan tingkat TKU tertinggi (Penegak: Bantara -> Laksana)
    let levelTku = '';
    if (Array.isArray(tku) && tku.length > 0) {
      if (tku.some((item) => item.laksana === true)) levelTku = 'LAKSANA';
      else if (tku.some((item) => item.bantara === true)) levelTku = 'BANTARA';
    }

    // Syarat Pramuka Garuda golongan Penegak (SK Kwarnas) - dihitung secara TOTAL, bukan per bidang
    const MIN_TKK = 10;
    const MIN_BIDANG = 5;
    const MIN_PURWA = 5;
    const MIN_MADYA = 3;
    const MIN_UTAMA = 2;

    // Gabungkan (dedupe) TKK per type_tkk_id, karena satu member bisa punya
    // lebih dari satu record untuk jenis TKK yang sama. Gabung dengan OR per tingkat.
    const mergedTkk = new Map<string, { purwa: boolean; madya: boolean; utama: boolean }>();
    tkks.forEach((tkk) => {
      const key = String(tkk.type_tkk_id);
      const prev = mergedTkk.get(key) || { purwa: false, madya: false, utama: false };
      mergedTkk.set(key, {
        purwa: prev.purwa || tkk.purwa === true,
        madya: prev.madya || tkk.madya === true,
        utama: prev.utama || tkk.utama === true,
      });
    });

    // Ambil bidang (sector) dari master TypeTkk untuk semua jenis TKK milik member
    const typeTkkIds = Array.from(mergedTkk.keys()).filter((id) => Types.ObjectId.isValid(id));
    const typeTkkList = await TypeTkk.find({ _id: { $in: typeTkkIds.map((id) => new Types.ObjectId(id)) } })
      .select('_id sector')
      .lean();
    const sectorMap = new Map<string, string>();
    typeTkkList.forEach((type: any) => {
      sectorMap.set(String(type._id), type.sector || 'Tanpa Bidang');
    });

    // Hitung hanya TKK yang minimal sudah dicapai satu tingkat
    let totalPurwa = 0;
    let totalMadya = 0;
    let totalUtama = 0;
    const bidangSet = new Set<string>();
    let jumlahTkk = 0;

    mergedTkk.forEach((tingkat, typeTkkId) => {
      if (!tingkat.purwa && !tingkat.madya && !tingkat.utama) return;
      jumlahTkk += 1;
      bidangSet.add(sectorMap.get(typeTkkId) || 'Tanpa Bidang');
      if (tingkat.purwa) totalPurwa += 1;
      if (tingkat.madya) totalMadya += 1;
      if (tingkat.utama) totalUtama += 1;
    });

    const jumlahBidang = bidangSet.size;

    const kekurangan: string[] = [];
    if (levelTku !== 'LAKSANA') {
      kekurangan.push(`TKU harus Laksana (saat ini ${levelTku ? levelTku.charAt(0) + levelTku.slice(1).toLowerCase() : 'belum ada TKU'})`);
    }
    if (jumlahTkk < MIN_TKK) {
      kekurangan.push(`minimal ${MIN_TKK} macam TKK (saat ini ${jumlahTkk})`);
    }
    if (jumlahBidang < MIN_BIDANG) {
      kekurangan.push(`minimal ${MIN_BIDANG} bidang TKK (saat ini ${jumlahBidang})`);
    }
    if (totalPurwa < MIN_PURWA) {
      kekurangan.push(`minimal ${MIN_PURWA} TKK Purwa (saat ini ${totalPurwa})`);
    }
    if (totalMadya < MIN_MADYA) {
      kekurangan.push(`minimal ${MIN_MADYA} TKK Madya (saat ini ${totalMadya})`);
    }
    if (totalUtama < MIN_UTAMA) {
      kekurangan.push(`minimal ${MIN_UTAMA} TKK Utama (saat ini ${totalUtama})`);
    }

    if (kekurangan.length > 0) {
      return new NextResponse(
        JSON.stringify({
          message: `Syarat tidak terpenuhi: ${kekurangan.join(', ')}`,
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    // --- END VALIDATION ---
    // Cek jika member_id sudah ada di Garuda
    const existingGaruda = await Garuda.findOne({ member_id: member_id });
    if (existingGaruda) {
      return new NextResponse(JSON.stringify({ message: 'Member ini sudah terdaftar di data Garuda.' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    // Simpan jumlah asli hasil hitungan (setelah dedupe per jenis TKK)
    const newGaruda = new Garuda({ member_id: member_id, level_tku: levelTku, total_purwa: totalPurwa, total_madya: totalMadya, total_utama: totalUtama, status: 0 });
    await newGaruda.save();
    await newGaruda.populate({ path: 'member_id', select: 'name nta', model: Member });

    // Log activity
    await ActivityLog.create({
      user_id: user_id,
      action: 'create',
      description: `Menambahkan data Garuda untuk user ${newGaruda.user_id?.name || ''}`,
      module: 'Garuda',
    });

    return new NextResponse(JSON.stringify({ message: 'Garuda created successfully', data: newGaruda.toObject() }), { status: 201, headers: { 'Content-Type': 'application/json' } });
  } catch (error: any) {
    console.error('Error creating Garuda:', error);
    return new NextResponse('Internal Server Error: ' + error.message, { status: 500 });
  }
};
