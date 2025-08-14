import axios from "axios";
// const BASE_URL = "http://localhost:3000";
const BASE_URL = "https://rmr-backend.vercel.app";

export const createReturnsApi = async (data: unknown, storeId: string) => {
  try {
    const response = await axios.post(
      `${BASE_URL}/api/v1/returns/create/${storeId}`,
      data,
    );
    return response;
  } catch (error) {
    console.log(error);
  }
};

export const getReturnsByStoreIdApi = async (storeId: string) => {
  try {
    const response = await axios.get(
      `${BASE_URL}/api/v1/returns/get/${storeId}`,
    );
    return response;
  } catch (error) {
    console.log(error);
  }
};

export const getAllReturnsApi = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/api/v1/returns/all`);
    return response;
  } catch (error) {
    console.log(error);
  }
};

export const approveReturnApi = async (returnId: string) => {
  try {
    const response = await axios.post(
      `${BASE_URL}/api/v1/returns/approve/${returnId}`,
    );
    return response;
  } catch (error) {
    console.log(error);
  }
};

export const declineReturnApi = async (returnId: string) => {
  try {
    const response = await axios.post(
      `${BASE_URL}/api/v1/returns/decline/${returnId}`,
    );
    return response;
  } catch (error) {
    console.log(error);
  }
};

export const getReturnsByFromToDateApi = async (
  storeId: string,
  fromDate: unknown,
  toDate: unknown,
) => {
  try {
    const response = await axios.post(
      `${BASE_URL}/api/v1/returns/fromToDate/${storeId}`,
      {
        fromDate,
        toDate,
      },
    );
    return response;
  } catch (error) {
    console.log(error);
  }
};

export const getReturnsByPageApi = async (
  page: number,
  limit: number,
  branchId: string,
) => {
  try {
    const response = await axios.get(
      `${BASE_URL}/api/v1/returns/getReturnsByPage?page=${page}&limit=${limit}&branchId=${branchId}`,
    );
    return response;
  } catch (error) {
    console.log(error);
  }
};
