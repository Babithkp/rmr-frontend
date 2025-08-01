import axios from "axios";
// const BASE_URL = "http://localhost:3000";
const BASE_URL = "https://rmr-backend.vercel.app";

export const getStoreIdApi = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/api/v1/settings/getStoreId`);
    return response;
  } catch (error) {
    console.log(error);
  }
};

export const getItemIdApi = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/api/v1/settings/getItemId`);
    return response;
  } catch (error) {
    console.log(error);
  }
};
