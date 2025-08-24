import axiosInstance from '@/providers/axios-instance';

interface UserParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface UserPayload {
  name: string;
  email: string;
  role: string;
  institution_id?: string;
  password?: string;
}

export const getUsers = async (params: UserParams) => {
  try {
    const response = await axiosInstance.get('/users', {
      params,
    });
    return response.data;
  } catch (error: any) {
    console.log('Error fetching users:', error);
    throw error.response?.data;
  }
};

export const getUserById = async (id: string) => {
  try {
    const response = await axiosInstance.get(`/users/${id}`);
    return response.data;
  } catch (error: any) {
    console.log('Error fetching user by ID:', error);
    throw error.response?.data;
  }
};

export const registerUser = async (data: UserPayload) => {
  try {
    const response = await axiosInstance.post('/users/register', data);
    return response.data;
  } catch (error: any) {
    console.log('Error creating user:', error);
    throw error.response?.data;
  }
};

export const createUser = async (data: UserPayload) => {
  try {
    const response = await axiosInstance.post('/users', data);
    return response.data;
  } catch (error: any) {
    console.log('Error creating user:', error);
    throw error.response?.data;
  }
};

export const updateUser = async (id: string, data: UserPayload) => {
  try {
    const response = await axiosInstance.patch(`/users/${id}`, data);
    return response.data;
  } catch (error: any) {
    console.log('Error updating user:', error);
    throw error.response?.data;
  }
};

export const updateStatus = async (id: string) => {
  try {
    const response = await axiosInstance.patch(`/users/${id}/status`);
    return response.data;
  } catch (error: any) {
    console.log('Error updating user status:', error);
    throw error.response?.data;
  }
};

export const deleteUser = async (id: string) => {
  try {
    const response = await axiosInstance.delete(`/users/${id}`);
    return response.data;
  } catch (error: any) {
    console.log('Error deleting user:', error);
    throw error.response?.data;
  }
};
