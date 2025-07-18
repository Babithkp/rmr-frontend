import axios from "axios";
// const BASE_URL = "http://localhost:3000";
const BASE_URL = "https://rmr-backend.vercel.app";


export const createItemApi = async (data: unknown) => {
  try {
    const response = await axios.post(`${BASE_URL}/api/v1/item/create`, data);
    return response;
  } catch (error) {
    console.log(error);
  }
};

export const getAllItemsApi = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/api/v1/item/all`);
    return response;
  } catch (error) {
    console.log(error);
  }
};

export const deleteItemApi = async (id: string) => {
  try {
    const response = await axios.delete(`${BASE_URL}/api/v1/item/${id}`);
    return response;
  } catch (error) {
    console.log(error);
  }
};

export const createBomApi = async (data: unknown) => {
  try {
    const response = await axios.post(`${BASE_URL}/api/v1/item/bom/create`, data);
    return response;
  } catch (error) {
    console.log(error);
  }
};

export const getAllBomsApi = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/api/v1/item/bom/all`);
    return response;
  } catch (error) {
    console.log(error);
  }
};

export const deleteBomApi = async (id: string) => {
  try {
    const response = await axios.delete(`${BASE_URL}/api/v1/item/bom/${id}`);
    return response;
  } catch (error) {
    console.log(error);
  }
};