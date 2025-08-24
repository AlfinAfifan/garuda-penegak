import axiosInstance from '@/providers/axios-instance';

interface MemberParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface MemberPayload {
  name: string;
  phone: string;
  institution_id: string | null;
  member_number: string;
  parent_number: string;
  gender: string;
  birth_place: string;
  birth_date: Date | null;
  religion: string;
  nationality: string;
  rt: string;
  rw: string;
  village: string;
  sub_district: string;
  district: string;
  province: string;
  talent: string;
  father_name: string;
  father_birth_place: string;
  father_birth_date: Date | null;
  mother_name: string;
  mother_birth_place: string;
  mother_birth_date: Date | null;
  parent_address: string;
  parent_phone: string;
  entry_date: Date | null;
  exit_date: Date | null;
  entry_level: string;
  exit_reason: string;
}

export const getMembers = async (params: MemberParams) => {
  try {
    const response = await axiosInstance('/member', {
      params,
    });
    return response.data;
  } catch (error: any) {
    console.error('Error fetching members:', error);
    throw error.response?.data;
  }
};

export const getMemberById = async (id: string) => {
  try {
    const response = await axiosInstance(`/member/${id}`);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching member by ID:', error);
    throw error.response?.data;
  }
};

export const createMember = async (data: any) => {
  try {
    const response = await axiosInstance.post('/member', data);
    return response.data;
  } catch (error: any) {
    console.error('Error creating member:', error);
    throw error.response?.data;
  }
};

export const updateMember = async (id: string, data: any) => {
  try {
    const response = await axiosInstance.patch(`/member/${id}`, data);
    return response.data;
  } catch (error: any) {
    console.error('Error updating member:', error);
    throw error.response?.data;
  }
};

export const deleteMember = async (id: string) => {
  try {
    const response = await axiosInstance.delete(`/member/${id}`);
    return response.data;
  } catch (error: any) {
    console.error('Error deleting member:', error);
    throw error.response?.data;
  }
};

export const exportMembers = async () => {
  try {
    const response = await axiosInstance.get('/member/export');
    return response.data;
  } catch (error: any) {
    console.error('Error exporting members:', error);
    throw error.response?.data;
  }
}
