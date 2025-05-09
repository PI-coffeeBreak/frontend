import axios from "axios";

export const axiosWithAuth = (keycloak) => {
  const instance = axios.create();

  // Add request interceptor to always inject latest token
  instance.interceptors.request.use(
    async (config) => {
      if (keycloak?.token) {
        try {
          // Try to refresh the token if it will expire in less than 60 seconds
          await keycloak.updateToken(60);
          config.headers.Authorization = `Bearer ${keycloak.token}`;
        } catch (err) {
          console.error("Token refresh failed", err);
        }
      } else {
        console.warn("No token available");
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  return instance;
};

export default axiosWithAuth;
