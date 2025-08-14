import axios from "axios";
// const BASE_URL = "http://localhost:3000";
const BASE_URL = "https://rmr-backend.vercel.app";

export const receiptCreateApi = async (data: unknown) => {
  try {
    const response = await axios.post(
      `${BASE_URL}/api/v1/receipt/create`,
      data,
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
    const response = await axios.get(`${BASE_URL}/api/v1/receipt/getRecieptsByStoreId/${storeId}`);
    return response;
  } catch (error) {
    console.log(error);
  }
};

export const receiptApproveApi = async (receiptId: string) => {
  try {
    const response = await axios.post(
      `${BASE_URL}/api/v1/receipt/approve/${receiptId}`,
    );
    return response;
  } catch (error) {
    console.log(error);
  }
};

export const updateReceiptApi = async (data: {
  id: string;
  items: unknown;
  totalAmount: number;
  totalTax: number;
}) => {
  try {
    const response = await axios.patch(
      `${BASE_URL}/api/v1/receipt/${data.id}`,
      data,
    );
    return response;
  } catch (error) {
    console.log(error);
  }
};

export const deleteReceiptApi = async (receiptId: string) => {
  try {
    const response = await axios.delete(
      `${BASE_URL}/api/v1/receipt/${receiptId}`,
    );
    return response;
  } catch (error) {
    console.log(error);
  }
};

export const getReceiptsByPageApi = async (page: number, limit: number, branchId: string) => {
  try {
    const response = await axios.get(`${BASE_URL}/api/v1/receipt/getReceiptsByPage?page=${page}&limit=${limit}&branchId=${branchId}`);
    return response;
  } catch (error) {
    console.log(error);
  }
};