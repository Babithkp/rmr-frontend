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

export const deleteOrderApi = async (orderId: string) => {
  try {
    const response = await axios.delete(`${BASE_URL}/api/v1/order/${orderId}`);
    return response;
  } catch (error) {
    console.log(error);
  }
};

export const getOrderByIdApi = async (orderId: string) => {
  try {
    const response = await axios.get(
      `${BASE_URL}/api/v1/order/order/${orderId}`,
    );
    return response;
  } catch (error) {
    console.log(error);
  }
};

export const updateOrderApi = async (data: {
  orderId: string;
  items: unknown;
}) => {
  try {
    const response = await axios.patch(
      `${BASE_URL}/api/v1/order/${data.orderId}`,
      data,
    );
    return response;
  } catch (error) {
    console.log(error);
  }
};

export const getOrdersByFromToDateApi = async (
  fromDate: unknown,
  toDate: unknown,
) => {
  try {
    const response = await axios.post(`${BASE_URL}/api/v1/order/fromToDate`, {
      fromDate,
      toDate,
    });
    return response;
  } catch (error) {
    console.log(error);
  }
};

export const getOrdersByStoreDateApi = async (
  storeId: string,
  fromDate: unknown,
  toDate: unknown,
) => {
  try {
    const response = await axios.post(
      `${BASE_URL}/api/v1/order/storeDate/${storeId}`,
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
