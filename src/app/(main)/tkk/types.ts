export interface TkkData {
  _id: string;
  member_id: string;
  purwa: boolean;
  madya: boolean;
  utama: boolean;
  sk_purwa: string;
  sk_madya: string;
  sk_utama: string;
  date_purwa: string | null;
  date_madya: string | null;
  date_utama: string | null;
  examiner_name_purwa: string;
  examiner_address_purwa: string;
  examiner_position_purwa: string;
  examiner_name_madya: string;
  examiner_address_madya: string;
  examiner_position_madya: string;
  examiner_name_utama: string;
  examiner_address_utama: string;
  examiner_position_utama: string;
  createdAt: string;
  updatedAt: string;
  type_tkk: {
    id: string;
    name: string;
  };
  member?: {
    name: string;
    phone: string;
    member_number: string; 
  };
  institution?: {
    _id: string;
    name: string;
  };
}

export interface TkuPayload {
  member_id: string;
  purwa?: boolean;
  madya?: boolean;
  utama?: boolean;
  sk_purwa?: string;
  sk_madya?: string;
  sk_utama?: string;
  date_purwa?: string | null;
  date_madya?: string | null;
  date_utama?: string | null;
}
