import axiosInstance from '@/providers/axios-instance';

interface ParamsTku {
  search?: string;
  page?: number;
  limit?: number;
}

export interface BantaraPayload {
  member_id: string;
}

export interface LaksanaPayload {
    id: string
}

export const getSummary = async () => {
  try {
    const response = await axiosInstance.get('/tku');
    return response.data
  } catch (error: any) {
    console.error('Failed to fetch summary:', error);
    throw error.response?.data
  }
};

export const getBantara = async (params: ParamsTku) => {
  try {
    const response = await axiosInstance.get('/tku/bantara', {
      params,
    });

    const data = response.data;
    return data;
  } catch (error: any) {
    console.error('Failed to fetch Bantara:', error);
    throw error.response?.data
  }
};

export const getLaksana = async (params: ParamsTku) => {
  try {
    const response = await axiosInstance.get('/tku/laksana', {
      params,
    });

    const data = response.data;
    return data;
  } catch (error: any) {
    console.error('Failed to fetch Laksana:', error);
    throw error.response?.data
  }
};  

export const createBantara = async (data: BantaraPayload) => {
  try {
    const response = await axiosInstance.post('/tku/bantara', data);
    return response.data;
  } catch (error: any) {
    console.error('Failed to create Bantara:', error);
    throw error.response?.data
  }
};

export const createLaksana = async (data: LaksanaPayload) => {
  try {
    const response = await axiosInstance.post('/tku/laksana', data);
    return response.data;
  } catch (error: any) {
    console.error('Failed to create Laksana:', error);
    throw error.response?.data
  }
};

export const deleteBantara = async (id: string) => {
  try {
    const response = await axiosInstance.delete(`/tku/bantara/${id}`);
    return response.data;
  } catch (error: any) {
    console.error('Failed to delete Bantara:', error);
    throw error.response?.data
  }
};

export const deleteLaksana = async (id: string) => {
  try {
    const response = await axiosInstance.delete(`/tku/laksana/${id}`);
    return response.data;
  } catch (error: any) {
    console.error('Failed to delete Laksana:', error);
    throw error.response?.data
  }
};

export const exportTku = async () => {
  try {
    const response = await axiosInstance.get('/tku/export');
    return response.data;
  } catch (error: any) {
    console.error('Error exporting TKU data:', error);
    throw error.response?.data;
  }
};