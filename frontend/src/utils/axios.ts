import axios from 'axios';
import { toast } from './toast';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1',
  timeout: 10000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      toast.error('Network error! Please check your connection.');
      return Promise.reject(error);
    }

    const message = error.response?.data?.message || 'Something went wrong';

    if (error.response?.status >= 500) {
      toast.error('Server error! Please try again later.');
    } else {
      toast.error(message);
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;