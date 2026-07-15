import axiosInstance from "../../utils/axios";

interface LoginResponse {
  message: string;
  data: {
    user: {
      id: string;
      email: string;
      name: string;
      role: string;
    };
  };
}

interface UserResponse {
  data: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
}

export const authApi = {
  login: (email: string, password: string) =>
    axiosInstance
      .post<LoginResponse>("/auth/login", { email, password })
      .then((res) => res.data),

  me: () => axiosInstance.get<UserResponse>("/auth/me").then((res) => res.data),

 logout: async () => {
  console.log('Calling logout...');
  const response = await axiosInstance.post('/auth/logout');
  console.log('Logout response:', response.data);
  return response.data;
},
};
