import axios from "axios";

export const axiosWithAuth = (keycloak) => {
  const token = keycloak?.token;
  console.log("Token present:", !!token);

  if (!token) {
    console.warn("No token available in axiosWithAuth");
  }

  const instance = axios.create({
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
    },
  });

  // Add request interceptor to log headers
  instance.interceptors.request.use(
    (config) => {
      console.log("Request headers:", config.headers);
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  return instance;
};
