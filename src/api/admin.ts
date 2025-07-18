import axios from "axios";
// const BASE_URL = "http://localhost:3000";
const BASE_URL = "https://rmr-backend.vercel.app";

export const adminLoginApi = async (username: string, password: string) => {
  try {
    const response = await axios.post(`${BASE_URL}/api/v1/admin/login`, {
      username,
      password,
    });
    return response;
  } catch (error) {
    console.log(error);
  }
};
