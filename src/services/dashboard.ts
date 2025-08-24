import axiosInstance from "@/providers/axios-instance";

export const getDashboard = async () => {
  try {
    const response = await axiosInstance.get('/dashboard');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch dashboard data:', error);
    throw error;
  }
}