import axios from "axios";
// const BASE_URL = "http://localhost:3000";
const BASE_URL = "https://rmr-backend.vercel.app";

export const createStoreApi = async (data: unknown) => {
  try {
    const response = await axios.post(`${BASE_URL}/api/v1/store/create`, data);
    return response;
  } catch (error) {
    console.log(error);
  }
};

export const getAllStoresApi = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/api/v1/store/all`);
    return response;
  } catch (error) {
    console.log(error);
  }
};

export const storeLoginApi = async (username: string, password: string) => {
  try {
    const response = await axios.post(`${BASE_URL}/api/v1/store/login`, {
      username,
      password,
    });
    return response;
  } catch (error) {
    console.log(error);
  }
};

export const getStoreItemsApi = async (storeId: string) => {
  try {
    const response = await axios.get(
      `${BASE_URL}/api/v1/store/items/${storeId}`
    );
    return response;
  } catch (error) {
    console.log(error);
  }
};

export const createClosingStockApi = async (data: unknown) => {
  try {
    const response = await axios.post(
      `${BASE_URL}/api/v1/store/closingStock`,
      data
    );
    return response;
  } catch (error) {
    console.log(error);
  }
};

export const getClosingStockApi = async (storeId: string) => {
  try {
    const response = await axios.get(
      `${BASE_URL}/api/v1/store/closingStockByStoreId/${storeId}`
    );
    return response;
  } catch (error) {
    console.log(error);
  }
};

export const getAllClosingStockApi = async () => {
  try {
    const response = await axios.get(
      `${BASE_URL}/api/v1/store/closingStockByStoreId`
    );
    return response;
  } catch (error) {
    console.log(error);
  }
};

export const getClosingStockOfTodayApi = async () => {
  try {
    const response = await axios.get(
      `${BASE_URL}/api/v1/store/closingStock/today`
    );
    return response;
  } catch (error) {
    console.log(error);
  }
};

export const deleteClosingStockApi = async (id: string) => {
  try {
    const response = await axios.delete(
      `${BASE_URL}/api/v1/store/closingStock/${id}`
    );
    return response;
  } catch (error) {
    console.log(error);
  }
};


export const getOpeningStockApi = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/api/v1/store/openingStock`);
    return response;
  } catch (error) {
    console.log(error);
  }
};