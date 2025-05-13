import axios from "axios";

export const axiosWithAuth = (keycloak) => {
  const instance = axios.create();

  // Add request interceptor to always inject latest token
  instance.interceptors.request.use(
    async (config) => {
      if (keycloak?.token) {
        try {
          // Try to refresh the token if it will expire in less than 70 seconds
          await keycloak.updateToken(70);
          config.headers.Authorization = `Bearer ${keycloak.token}`;
        } catch (err) {
          console.error("Token refresh failed in request interceptor:", err);
          // Don't throw here, let the request proceed and handle 401 in response interceptor
          
        }
      } else {
        console.warn("No token available for request");
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
      const originalRequest = error.config;
      
      // Handle both HTTP 401 and our custom "No token available" error
      if (error.response?.status === 401 || error.message === "No token available") {
        // Don't redirect if we're already on the auth-redirect page or root path
        if (!window.location.pathname.includes('auth-redirect') && window.location.pathname !== '/') {
          // Store the current URL to redirect back after login
          const currentPath = window.location.pathname + window.location.search;
          sessionStorage.setItem('redirectAfterLogin', currentPath);
          
          // Attempt to refresh token one last time
          try {
            await keycloak.updateToken(70);
            // If refresh successful, retry the original request
            originalRequest.headers.Authorization = `Bearer ${keycloak.token}`;
            return axios(originalRequest);
          } catch (refreshError) {
            console.error("Final token refresh attempt failed:", refreshError);
            // Redirect to login
            keycloak.login({
              redirectUri: window.location.origin + '/auth-redirect'
            });
          }
        }
      }
      return Promise.reject(error);
    }
  );
  return instance;
};

export default axiosWithAuth;
