import axios from "axios";
// const BASE_URL = "http://localhost:3000";
const BASE_URL = "https://rmr-backend.vercel.app";

export const receiptCreateApi = async (data: unknown) => {
  try {
    const response = await axios.post(
      `${BASE_URL}/api/v1/receipt/create`,
      data
    );
    return response;
  } catch (error) {
    console.log(error);
  }
};


export const receiptGetAllApi = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/api/v1/receipt/all`);
    return response;
  } catch (error) {
    console.log(error);
  }
};

export const receiptGetByStoreIdApi = async (storeId: string) => {
  try {
    const response = await axios.get(`${BASE_URL}/api/v1/receipt/${storeId}`);
    return response;
  } catch (error) {
    console.log(error);
  }
};

export const receiptApproveApi = async (receiptId: string, storeId: string) => {
  try {
    const response = await axios.post(`${BASE_URL}/api/v1/receipt/approve/${receiptId}/${storeId}`);
    return response;
  } catch (error) {
    console.log(error);
  }
};