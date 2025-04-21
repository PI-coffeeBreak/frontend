import React from "react";
import { Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Layout from "./components/layout/Layout.jsx";
import LayoutAuth from "./components/layout/LayoutAuth.jsx";
import LayoutInstantiate from "./components/layout/LayoutInstantiate.jsx";
import Users from "./pages/Users.jsx";
import Alerts from "./pages/Alerts.jsx";
import Activities from "./pages/Activities.jsx";
import Schedule from "./pages/Schedule.jsx";
import Plugins from "./pages/Plugins.jsx";
import Colors from "./pages/Colors.jsx";
import PrivateRoute from "./PrivateRoute.js";
import { PagesList } from "./pages/PagesList.jsx";
import { MenuEditor } from "./pages/MenuEditor.jsx";
import EventSetup from "./pages/EventSetup.jsx";
import EventMaker from "./pages/EventMaker.jsx";
import Instantiate from "./pages/Instantiate.jsx";
import { CreatePage } from "./pages/page_editor/CreatePage.jsx";
import { EditPage } from "./pages/page_editor/EditPage.jsx";
import AuthRedirect from "./pages/AuthRedirect";
import { Sponsors } from "./pages/Sponsors.jsx";
import { EventEditor } from "./pages/EventEditor.jsx";
import Provider from "./contexts/Provider.jsx";

export default function App() {
  return (
    <Provider>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
        </Route>
        <Route element={<LayoutAuth />}>
          <Route path="setup" element={<EventSetup />} />
        </Route>

        <Route path="instantiate" element={<PrivateRoute><LayoutInstantiate /></PrivateRoute>}>
          <Route index element={<Instantiate />} />
          <Route path="home">
            <Route path="users" element={<Users />} />
            <Route path="sessions" element={<Activities />} />
            <Route path="alerts" element={<Alerts />} />
          </Route>
          <Route path="eventmaker">
            <Route index element={<EventMaker />} />
            <Route path="edit" element={<EventEditor />} />
            <Route path="colors" element={<Colors />} />
            <Route path="menus" element={<MenuEditor />} />
            <Route path="pages" element={<PagesList />} />
            <Route path="choose-plugins" element={<Plugins />} />
            <Route path="edit-page/:pageTitle" element={<EditPage />} />
            <Route path="create-page" element={<CreatePage />} />
          </Route>
          <Route path="plugins">
            <Route path="alert-system-plugin" element={<Alerts />} />
            <Route path="event-schedule-plugin" element={<Schedule />} />
            <Route path="sponsors-promotion-plugin" element={<Sponsors />} />
            <Route path="schedule" element={<Schedule />} />
          </Route>
        </Route>
        <Route path="/auth-redirect" element={<AuthRedirect />} />
      </Routes>
    </Provider>
  );
}