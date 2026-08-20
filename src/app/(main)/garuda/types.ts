export type GarudaMember = {
  _id: string;
  name: string;
  nta: string;
};

export type GarudaData = {
  _id: string;
  member_id: GarudaMember;
  institution_id: string | null;
  institution_name: string | null;
  institution_sub_district: string | null;
  level_tku: string;
  total_purwa: string;
  total_madya: string;
  total_utama: string;
  status: number;
  approved_by: string | null;
  approved_at: string | null;
  certificate_number: number | null;
  certificate_year: number | null;
  createdAt: string;
  updatedAt: string;
};