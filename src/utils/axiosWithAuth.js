import axios from "axios";

export const axiosWithAuth = (keycloak) => {
  const token = keycloak?.token;
  return axios.create({
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
    },
  });
};
