import axiosInstance from "@/providers/axios-instance";

interface ParamsTypeTkk {
  search?: string;
  page?: number;
  limit?: number;
}

export interface TypeTkkPayload {
    name: string;
    sector?: string;
    color?: string;
}

export const getTypeTkk = async (params: ParamsTypeTkk) => {
  try {
    const response = await axiosInstance.get('/type-tkk', {
      params
    });

    const data = response.data;
    return data;
  } catch (error: any) {
    console.error('Failed to fetch type TKK:', error);
    throw error.response?.data
  }
}

export const getTypeTkkById = async (id: string) => {
  try {
    const response = await axiosInstance.get(`/type-tkk/${id}`);
    return response.data;
  } catch (error: any) {
    console.error('Failed to fetch type TKK by ID:', error);
    throw error.response?.data
  }
}

export const createTypeTkk = async (data: TypeTkkPayload) => {
  try {
    const response = await axiosInstance.post('/type-tkk', data);
    return response.data;
  } catch (error: any) {
    console.error('Failed to create type TKK:', error);
    throw error.response?.data
  }
}

export const updateTypeTkk = async (id: string, data: TypeTkkPayload) => {
  try {
    const response = await axiosInstance.patch(`/type-tkk/${id}`, data);
    return response.data;
  } catch (error: any) {
    console.error('Failed to update type TKK:', error);
    throw error.response?.data
  }
}

export const deleteTypeTkk = async (id: string) => {
  try {
    const response = await axiosInstance.delete(`/type-tkk/${id}`);
    return response.data;
  } catch (error: any) {
    console.error('Failed to delete type TKK:', error);
    throw error.response?.data
  }
}