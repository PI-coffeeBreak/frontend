import React from "react";
import { ReactKeycloakProvider } from '@react-keycloak/web';
import { BrowserRouter as Router } from "react-router-dom";

import keycloak from "../keycloak.js";
import { ActivitiesProvider } from "./ActivitiesContext.jsx";
import { PluginsProvider } from "./PluginsContext.jsx";
import { ThemeProvider } from "./ThemeContext";
import { UsersProvider } from "./UsersContext.jsx";
import { PagesProvider } from "./PagesContext.jsx";
import { NotificationProvider } from "./NotificationContext.jsx";
import { ComponentsProvider } from "./ComponentsContext.jsx";
import { MenuProvider } from "./MenuContext.jsx";
import { ColorThemeProvider } from './ColorThemeContext';
import { AlertsProvider } from "./AlertsContext.jsx";
import { EventProvider } from "./EventContext.jsx";
import { MediaProvider } from "./MediaContext.jsx";

export const Provider = ({ children }) => {
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
                                {children}
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
};

export default Provider;