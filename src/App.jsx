import React from "react";
import { Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Layout from "./components/layout/Layout.jsx";
import LayoutAuth from "./components/layout/LayoutAuth.jsx";
import LayoutInstantiate from "./components/layout/LayoutInstantiate.jsx";
import Users from "./pages/Users.jsx";
import Alerts from "./pages/plugins/Alerts.jsx";
import Activities from "./pages/Activities.jsx";
import Schedule from "./pages/plugins/Schedule.jsx";
import Plugins from "./pages/Plugins.jsx";
import { ThemeCustomizer } from "./components/event_maker/ThemeCustomizer.jsx";
import PrivateRoute from "./PrivateRoute.js";
import { PagesList } from "./pages/PagesList.jsx";
import { MenuEditor } from "./pages/MenuEditor.jsx";
import EventSetup from "./pages/EventSetup.jsx";
import EventMaker from "./pages/EventMaker.jsx";
import Instantiate from "./pages/Instantiate.jsx";
import { CreatePage } from "./pages/page_editor/CreatePage.jsx";
import { EditPage } from "./pages/page_editor/EditPage.jsx";
import AuthRedirect from "./pages/AuthRedirect";
import { Sponsors } from "./pages/plugins/Sponsors.jsx";
import { FloorPlans } from "./pages/plugins/FloorPlans.jsx";
import { EventEditor } from "./pages/EventEditor.jsx";
import Provider from "./contexts/Provider.jsx";
import Management from "./pages/Management.jsx";
import SpeakerManagement from "./pages/plugins/SpeakerManagement.jsx";
import ActivitySlotsPage from "./pages/plugins/ActivitiesSlotsPage.jsx";
import ActivitiesFeedback from "./pages/plugins/ActivitiesFeedback.jsx";
import { IconsEditor } from "./pages/IconsEditor.jsx";
import ActivityClassification from "./pages/plugins/ActivityClassification.jsx";

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
          {/* Dashboard */}
          <Route index element={<Instantiate />} />
          
          {/* Event section */}
          <Route path="event">
            <Route index element={<Management />} />
            <Route path="users" element={<Users />} />
            <Route path="activities" element={<Activities />} />
            <Route path="info" element={<EventEditor />} />
            <Route path="plugins" element={<Plugins />} />
          </Route>
          
          {/* Application section */}
          <Route path="application">
            <Route index element={<EventMaker />} />
            <Route path="pages">
              <Route index element={<PagesList />} />
              <Route path="edit-page/:pageTitle" element={<EditPage />} />
              <Route path="create-page" element={<CreatePage />} />
            </Route>
            <Route path="menus" element={<MenuEditor />} />
            <Route path="colors" element={<ThemeCustomizer />} />
            <Route path="icons" element={<IconsEditor />} />
          </Route>
          
          {/* Plugins section */}
          <Route path="plugins">
            <Route path="alert-system-plugin" element={<Alerts />} />
            <Route path="event-schedule-plugin" element={<Schedule />} />
            <Route path="sponsors-promotion-plugin" element={<Sponsors />} />
            <Route path="floor-plan-plugin" element={<FloorPlans />} />
            <Route path="speaker-presentation-plugin" element={<SpeakerManagement />} />
            <Route path="registration-system-plugin" element={<ActivitySlotsPage />} />
            <Route path="activities-feedback-plugin" element={<ActivitiesFeedback />} />
            <Route path="activity-classification-plugin" element={<ActivityClassification />} />
          </Route>
        </Route>
        <Route path="/auth-redirect" element={<AuthRedirect />} />
      </Routes>
    </Provider>
  );
}