import axiosInstance from '@/providers/axios-instance';

interface GetParams {
  search?: string;
  page?: number;
  limit?: number;
}

export interface InstitutionPayload {
  name: string;
  sub_district: string;
  address: string;
  gudep_man: string;
  gudep_woman: string;
  head_gudep_man: string;
  head_gudep_woman: string;
  nta_head_gudep_man: string;
  nta_head_gudep_woman: string;
  headmaster_name: string;
  headmaster_number: string;
}

export const getInstitution = async (params: GetParams) => {
  try {
    const response = await axiosInstance('/institution', {
      params,
    });
    return response.data;
  } catch (error: any) {
    console.error('Error fetching instance:', error);
    throw error.response?.data;
  }
};

export const getInstitutionById = async (id: string) => {
  try {
    const response = await axiosInstance(`/institution/${id}`);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching institution by ID:', error);
    throw error.response?.data;
  }
};

export const createInstitution = async (data: InstitutionPayload) => {
  try {
    const response = await axiosInstance.post('/institution', data);
    return response.data;
  } catch (error: any) {
    console.error('Error creating institution:', error);
    throw error.response?.data;
  }
};

export const updateInstitution = async (id: string, data: InstitutionPayload) => {
  try {
    const response = await axiosInstance.patch(`/institution/${id}`, data);
    return response.data;
  } catch (error: any) {
    console.error('Error updating institution:', error);
    throw error.response?.data;
  }
};

export const deleteInstitution = async (id: string | undefined) => {
  try {
    const response = await axiosInstance.delete(`/institution/${id}`);
    return response.data;
  } catch (error: any) {
    console.error('Error deleting institution:', error);
    throw error.response?.data;
  }
};

export const exportInstitution = async () => {
  try {
    const response = await axiosInstance.get('/institution/export');
    return response.data;
  } catch (error: any) {
    console.error('Error exporting institution data:', error);
    throw error.response?.data;
  }
};
