import axiosInstance from '@/providers/axios-instance';

interface ParamsTkk {
  search?: string;
  page?: number;
  limit?: number;
}

export interface PurwaPayload {
    member_id: string;
    type_tkk_id: string;
    examiner_name_purwa: string;
    examiner_address_purwa: string;
    examiner_position_purwa: string;
}

export interface MadyaPayload {
    id: string;
    examiner_name_madya: string;
    examiner_address_madya: string;
    examiner_position_madya: string;
}

export interface UtamaPayload {
    id: string;
    examiner_name_utama: string;
    examiner_address_utama: string;
    examiner_position_utama: string;
}

export const getSummary = async () => {
  try {
    const response = await axiosInstance(`/tkk`);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching TKK summary:', error);
    throw error.response?.data;
  }
};

export const getPurwa = async (params: ParamsTkk) => {
  try {
    const response = await axiosInstance.get('/tkk/purwa', { params });
    return response.data;
  } catch (error: any) {
    console.error('Error fetching Purwa:', error);
    throw error.response?.data;
  }
};

export const getMadya = async (params: ParamsTkk) => {
  try {
    const response = await axiosInstance.get('/tkk/madya', { params });
    return response.data;
  } catch (error: any) {
    console.error('Error fetching Madya:', error);
    throw error.response?.data;
  }
};

export const getUtama = async (params: ParamsTkk) => {
  try {
    const response = await axiosInstance.get('/tkk/utama', { params });
    return response.data;
  } catch (error: any) {
    console.error('Error fetching Utama:', error);
    throw error.response?.data;
  }
};

export const createPurwa = async (data: PurwaPayload) => {
  try {
    const response = await axiosInstance.post('/tkk/purwa', data);
    return response.data;
  } catch (error: any) {
    console.error('Error creating Purwa:', error);
    throw error.response?.data;
  }
}

export const createMadya = async (data: MadyaPayload) => {
  try {
    const response = await axiosInstance.post('/tkk/madya', data);
    return response.data;
  } catch (error: any) {
    console.error('Error creating Madya:', error);
    throw error.response?.data;
  }
};

export const createUtama = async (data: UtamaPayload) => {
  try {
    const response = await axiosInstance.post('/tkk/utama', data);
    return response.data;
  } catch (error: any) {
    console.error('Error creating Utama:', error);
    throw error.response?.data;
  }
};

export const deletePurwa = async (id: string) => {
  try {
    const response = await axiosInstance.delete(`/tkk/purwa/${id}`);
    return response.data;
  } catch (error: any) {
    console.error('Error deleting Purwa:', error);
    throw error.response?.data;
  }
}

export const deleteMadya = async (id: string) => {
  try {
    const response = await axiosInstance.delete(`/tkk/madya/${id}`);
    return response.data;
  } catch (error: any) {
    console.error('Error deleting Madya:', error);
    throw error.response?.data;
  }
};

export const deleteUtama = async (id: string) => {
  try {
    const response = await axiosInstance.delete(`/tkk/utama/${id}`);
    return response.data;
  } catch (error: any) {
    console.error('Error deleting Utama:', error);
    throw error.response?.data;
  }
};

export const exportTkk = async () => {
  try {
    const response = await axiosInstance.get('/tkk/export');
    return response.data;
  } catch (error: any) {
    console.error('Error exporting TKK data:', error);
    throw error.response?.data;
  }
}