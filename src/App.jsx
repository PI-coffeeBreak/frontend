import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
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
import { ActivitiesProvider } from "./contexts/ActivitiesContext.jsx";
import { PluginsProvider } from "./contexts/PluginsContext.jsx";
import { ThemeProvider } from "./contexts/ThemeContext";
import { UsersProvider } from "./contexts/UsersContext.jsx";
import EventSetup from "./pages/EventSetup.jsx";

export default function App() {
  return (
    <ThemeProvider>
     <PluginsProvider>
      <ActivitiesProvider>
        <UsersProvider>  
            <Router>
              <Routes>
                <Route element={<Layout />}>
                  <Route index element={<Home />} />
                </Route>
                <Route element={<LayoutAuth/>}>
                   <Route  path="register" element={<Register />}/>
                   <Route  path="login" element={<Login />}/>
                   <Route path="setup" element={<EventSetup/>}/>
                </Route>
                <Route path="instantiate" element={<LayoutInstantiate/>}>
                    <Route path="home">
                        <Route path="users" element={<Users />}/>
                        <Route path="sessions" element={<Activities/>}/>
                        <Route path="alerts" element={<Alerts/>}/>
                    </Route>
                    <Route path="eventmaker">
                        <Route path="colors" element={<Colors />}></Route>
                        <Route path="base-configurations" element={<BaseConfiguration />}></Route>
                        <Route path="plugins" element={<Plugins />}></Route>
                    </Route>
                    <Route path="schedule" element={<Schedule />}></Route>
                    <Route path="register" element={<ManualRegister />}></Route>
                </Route>
              </Routes>
            </Router>
          </UsersProvider>
        </ActivitiesProvider>
      </PluginsProvider>
    </ThemeProvider>
  );
}