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
          return Promise.reject(err);
        }
      } else {
        return Promise.reject(new Error("No token available"));
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Add response interceptor to handle 401 errors
  instance.interceptors.response.use(
    (response) => response,
    async (error) => {
      // Handle both HTTP 401 and our custom "No token available" error
      if (error.response?.status === 401 || error.message === "No token available") {
        // Don't redirect if we're already on the auth-redirect page or root path
        if (!window.location.pathname.includes('auth-redirect') && window.location.pathname !== '/') {
          keycloak.login({
            redirectUri: window.location.origin + '/auth-redirect'
          });
        }
      }
      return Promise.reject(error);
    }
  );
  return instance;
};

export default axiosWithAuth;
