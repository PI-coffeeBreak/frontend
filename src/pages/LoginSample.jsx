import React, { useState } from "react";
import keycloak from "../lib/keycloak";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  const login = async (e) => {
    e.preventDefault();


    try {
      const authenticated = await keycloak.init({
        onLoad: "login-required",
        checkLoginIframe: false,
      });
      if (authenticated) {
        console.log('User is authenticated');
        const token = keycloak.token;
        localStorage.setItem('token', token);
      } else {
        console.log('User is not authenticated');
      }
    } catch (error) {
      console.error('Failed to initialize adapter:', error);
    }
  };

  return (
    <div>
      <h2>Login</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <form onSubmit={login}>
        <button type="submit">Entrar</button>
      </form>
    </div>
  );
};

export default Login;
