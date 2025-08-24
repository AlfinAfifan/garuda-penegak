export interface TkuData {
  _id: string;
  member_id: string;
  bantara: boolean;
  laksana: boolean;
  sk_bantara: string;
  sk_laksana: string;
  date_bantara: string | null;
  date_laksana: string | null;
  createdAt: string;
  updatedAt: string;
  member?: {
    name: string;
    phone: string;
    member_number: string; // Optional field for member number
  };
  institution?: {
    _id: string;
    name: string;
  };
}

export interface TkuPayload {
  member_id: string;
  bantara?: boolean;
  laksana?: boolean;
  sk_bantara?: string;
  sk_laksana?: string;
  date_bantara?: string | null;
  date_laksana?: string | null;
}
