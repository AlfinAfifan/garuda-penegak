export type GarudaMember = {
  _id: string;
  name: string;
};

export type GarudaData = {
  _id: string;
  member_id: GarudaMember;
  level_tku: string;
  total_purwa: string;
  total_madya: string;
  total_utama: string;
  status: number;
  approved_by: string | null;
  createdAt: string;
  updatedAt: string;
};