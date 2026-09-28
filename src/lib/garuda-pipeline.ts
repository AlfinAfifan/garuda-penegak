import { Types } from 'mongoose';
import { JWT } from 'next-auth/jwt';

/** Stage filter garuda (role, lembaga, pencarian), dipakai list, export & summary supaya hasilnya sama. */
export const garudaFilterStages = (token: JWT | null, search: string, institutionId: string): any[] => [
  { $match: { is_delete: 0 } },
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

  // Filter by sub_district untuk admin_kecamatan.
  // Kalau sub_district / institution_id kosong, jangan tampilkan apa-apa (bukan semua data)
  ...(token?.role === 'admin_kecamatan'
    ? [
        {
          $match: token.sub_district ? { 'institution.sub_district': token.sub_district } : { _id: null },
        },
      ]
    : []),

  ...(token?.role === 'user'
    ? [
        {
          $match: token.institution_id ? { 'member.institution_id': new Types.ObjectId(token.institution_id as string) } : { _id: null },
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
];

export const garudaProjectStage = {
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
};
