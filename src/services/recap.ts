import axiosInstance from '@/providers/axios-instance';

interface RecapParams {
  search?: string;
  page?: number;
  limit?: number;
}

export const getRecapData = async (params: RecapParams) => {
  try {
    const response = await axiosInstance.get('/recap', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching recap data:', error);
    throw new Error('Failed to fetch recap data');
  }
};

export const exportRecapData = async () => {
  try {
    const response = await axiosInstance.get('/recap/export');
    return response.data;
  } catch (error) {
    console.error('Error exporting recap data:', error);
    throw new Error('Failed to export recap data');
  }
}