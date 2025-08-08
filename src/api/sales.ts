import axios from "axios";
// const BASE_URL = "http://localhost:3000";
const BASE_URL = "https://rmr-backend.vercel.app";

export const createSalesDataApi = async (data: unknown) => {
  try {
    const response = await axios.post(`${BASE_URL}/api/v1/sales/create`, data);
    return response;
  } catch (error) {
    console.log(error);
  }
};

export const getSalesDataForStoreApi = async (storeId: string) => {
  try {
    const response = await axios.get(
      `${BASE_URL}/api/v1/sales/get/${storeId}`
    );
    return response;
  } catch (error) {
    console.log(error);
  }
};