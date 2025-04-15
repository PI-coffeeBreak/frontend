import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ReactKeycloakProvider } from '@react-keycloak/web';

import Home from "./pages/Home";
import Layout from "./components/Layout";
import LayoutAuth from "./components/LayoutAuth";
import LayoutInstantiate from "./components/LayoutInstantiate.jsx";
import Users from "./pages/Users.jsx";
import Alerts from "./pages/Alerts.jsx";
import Activities from "./pages/Activities.jsx";
import Schedule from "./pages/Schedule.jsx";
import Plugins from "./pages/Plugins.jsx";
import Colors from "./pages/Colors.jsx";
import keycloak from "./keycloak.js";
import PrivateRoute from "./PrivateRoute.js";
import { PagesList } from "./pages/PagesList.jsx";
import { MenuEditor } from "./pages/MenuEditor.jsx";
import EventSetup from "./pages/EventSetup.jsx";
import EventMaker from "./pages/EventMaker.jsx";
import Instantiate from "./pages/Instantiate.jsx";
import { CreatePage } from "./pages/page_editor/CreatePage.jsx";
import { EditPage } from "./pages/page_editor/EditPage.jsx";
import SpeakerManagement from './pages/SpeakerManagement';
import AuthRedirect from "./pages/AuthRedirect";
import { Sponsors } from "./pages/Sponsors.jsx";

import { ActivitiesProvider } from "./contexts/ActivitiesContext.jsx";
import { PluginsProvider } from "./contexts/PluginsContext.jsx";
import { ThemeProvider } from "./contexts/ThemeContext";
import { UsersProvider } from "./contexts/UsersContext.jsx";
import { PagesProvider } from "./contexts/PagesContext.jsx";
import { NotificationProvider } from "./contexts/NotificationContext.jsx";
import { ComponentsProvider } from "./contexts/ComponentsContext.jsx";
import { MenuProvider } from "./contexts/MenuContext.jsx";
import { ColorThemeProvider } from './contexts/ColorThemeContext';
import { AlertsProvider } from "./contexts/AlertsContext.jsx";
import { EventProvider } from "./contexts/EventContext.jsx";
import { MediaProvider } from "./contexts/MediaContext.jsx";


export default function App() {
  return (
    <ColorThemeProvider>
      <ReactKeycloakProvider
        authClient={keycloak}
        initOptions={{
          checkLoginIframe: false,
          pkceMethod: 'S256',
          tokenRefreshInterval: 60
        }}
      >
        <NotificationProvider>
          <ThemeProvider>
            <PluginsProvider>
              <ComponentsProvider>
                <ActivitiesProvider>
                  <UsersProvider>
                    <MenuProvider>
                      <PagesProvider>
                        <AlertsProvider>
                          <EventProvider>
                            <MediaProvider>
                              <Router>
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
                                       <Route path="speaker-presentation-plugin" element={<SpeakerManagement />} />
                                      <Route path="schedule" element={<Schedule />} />
                                    </Route>
                                  </Route>
                                  <Route path="/auth-redirect" element={<AuthRedirect />} />
                                </Routes>
                              </Router>
                            </MediaProvider>
                          </EventProvider>
                        </AlertsProvider>
                      </PagesProvider>
                    </MenuProvider>
                  </UsersProvider>
                </ActivitiesProvider>
              </ComponentsProvider>
            </PluginsProvider>
          </ThemeProvider>
        </NotificationProvider>
      </ReactKeycloakProvider>
    </ColorThemeProvider>
  );
}