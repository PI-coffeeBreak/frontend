import { ReactKeycloakProvider } from '@react-keycloak/web';
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Layout from "./components/Layout";
import LayoutAuth from "./components/LayoutAuth";
import Register from "./pages/Register.jsx";
import Login from "./pages/Login.jsx";
import LayoutInstantiate from "./components/LayoutInstantiate.jsx";
import Users from "./pages/Users.jsx";
import Alerts from "./pages/Alerts.jsx";
import Activities from "./pages/Activities.jsx";
import Schedule from "./pages/Schedule.jsx";
import ManualRegister from "./pages/ManualRegister.jsx";
import Plugins from "./pages/Plugins.jsx";
import Colors from "./pages/Colors.jsx";
import BaseConfiguration from "./pages/BaseConfiguration.jsx";
import keycloak from "./keycloak.js";
import PrivateRoute from "./PrivateRoute.js";

export default function App() {
  return (
      <ReactKeycloakProvider 
        authClient={keycloak} 
        initOptions={{
          onLoad: 'login-required',
          checkLoginIframe: false,
          pkceMethod: 'S256',
          // Set a more reasonable token refresh time (in seconds)
          // The default is 5 seconds which is too frequent and causes issues
          tokenRefreshInterval: 60
        }}
      >
          <Router>
              <Routes>
                  <Route element={<Layout />}>
                      <Route index element={<Home />} />
                  </Route>
                  <Route element={<LayoutAuth/>}>
                      <Route  path="register" element={<Register />}/>
                      <Route  path="login" element={<Login />}/>
                  </Route>
                  <Route path="instantiate" element={<PrivateRoute><LayoutInstantiate/></PrivateRoute>}>
                      <Route path="home">
                          <Route path="users" element={<Users />}/>
                          <Route path="sessions" element={<Activities/>}/>
                          <Route path="alerts" element={<Alerts/>}/>
                      </Route>
                          <Route path="eventmaker">
                              <Route path="colors" element={<Colors/>}></Route>
                              <Route path="base-configurations" element={<BaseConfiguration/>}></Route>
                              <Route path="plugins" element={<Plugins/>}></Route>
                          </Route>
                          <Route path="schedule" element={<Schedule/>}></Route>
                          <Route path="register" element={<ManualRegister/>}></Route>
                  </Route>
              </Routes>
          </Router>
      </ReactKeycloakProvider>
  );
}