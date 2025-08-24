import axiosInstance from '@/providers/axios-instance';

interface GarudaParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface GarudaPayload {
  member_id: string;
}

export const getGaruda = async (params: GarudaParams) => {
  try {
    const response = await axiosInstance('/garuda', {
      params,
    });
    return response.data;
  } catch (error: any) {
    console.error('Error fetching Garuda data:', error);
    throw error.response?.data || error;
  }
};

export const getSummaryGaruda = async () => {
  try {
    const response = await axiosInstance('/garuda/summary');
    return response.data;
  } catch (error: any) {
    console.error('Error fetching Garuda summary:', error);
    throw error.response?.data || error;
  }
};

export const getGarudaByMemberId = async (member_id: string) => {
  try {
    const response = await axiosInstance(`/garuda/${member_id}`);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching Garuda by member ID:', error);
    throw error.response?.data || error;
  }
};

export const createGaruda = async (data: GarudaPayload) => {
  try {
    const response = await axiosInstance.post('/garuda', data);
    return response.data;
  } catch (error: any) {
    console.error('Error creating Garuda:', error);
    throw error.response?.data || error;
  }
};

export const approveGaruda = async (id: string) => {
  try {
    const response = await axiosInstance.patch(`/garuda/${id}`);
    return response.data;
  } catch (error: any) {
    console.error('Error updating Garuda:', error);
    throw error.response?.data || error;
  }
};

export const deleteGaruda = async (id: string | undefined) => {
  try {
    const response = await axiosInstance.delete(`/garuda/${id}`);
    return response.data;
  } catch (error: any) {
    console.error('Error deleting Garuda:', error);
    throw error.response?.data || error;
  }
};