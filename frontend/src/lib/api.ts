import axios from "axios";

// Detect the backend URL based on the current host (works for localhost and mobile)
export const getBaseURL = () => {
  if (typeof window === "undefined") return "http://127.0.0.1:8001/api";
  const { hostname } = window.location;
  return `http://${hostname}:8001/api`;
};


export const baseURL = getBaseURL().replace(/\/api$/, '');

export const api = axios.create({
  baseURL: getBaseURL(),
  withCredentials: true,
});
