import axios from "axios";
// const BASE_URL = "http://localhost:3000";
const BASE_URL = "https://rmr-backend.vercel.app";

export const createOrderApi = async (data: unknown) => {
  try {
    const response = await axios.post(`${BASE_URL}/api/v1/order/create`, data);
    return response;
  } catch (error) {
    console.log(error);
  }
};


export const getAllOrdersApi = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/api/v1/order/all`);
    return response;
  } catch (error) {
    console.log(error);
  }
};


export const getOrdersByStoreIdApi = async (storeId: string) => {
  try {
    const response = await axios.get(`${BASE_URL}/api/v1/order/${storeId}`);
    return response;
  } catch (error) {
    console.log(error);
  }
};