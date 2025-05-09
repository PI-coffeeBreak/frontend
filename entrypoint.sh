#!/bin/sh

cat <<EOF > /usr/share/nginx/html/config.js
window.__RUNTIME_CONFIG__ = {
  VITE_API_BASE_URL: "${API_BASE_URL}",
  VITE_WS_BASE_URL: "${WS_BASE_URL}",
  VITE_KEYCLOAK_URL: "${KEYCLOAK_URL}",
  VITE_KEYCLOAK_REALM: "${KEYCLOAK_REALM}",
  VITE_KEYCLOAK_CLIENT_ID: "${KEYCLOAK_CLIENT_ID}",
};
EOF

exec nginx -g "daemon off;"
