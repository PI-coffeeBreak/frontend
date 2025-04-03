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
import {useEffect, useState} from "react";
import PrivateRoute from "./PrivateRoute.js";

export default function App() {
    const [keycloakLoaded, setKeycloakLoaded] = useState(false);

    useEffect(() => {
        keycloak.init({ onLoad: 'login-required' }).then(authenticated => {
            setKeycloakLoaded(authenticated);
        });
    }, []);

    if (!keycloakLoaded) {
        return <div>Loading...</div>
    }

  return (
      <ReactKeycloakProvider authClient={keycloak}>
          <Router>
              <Routes>
                  <Route element={<Layout />}>
                      <Route index element={<Home />} />
                  </Route>
                  <Route element={<LayoutAuth/>}>
                      <Route  path="register" element={<Register />}/>
                      <Route  path="login" element={<Login />}/>
                  </Route>
                  <PrivateRoute>
                      <Route path="instantiate" element={<LayoutInstantiate/>}>
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
                  </PrivateRoute>
              </Routes>
          </Router>
      </ReactKeycloakProvider>
  );
}