import React from "react";
import PropTypes from "prop-types";
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
import { AlertsProvider } from "./AlertsContext.jsx";
import { EventProvider } from "./EventContext.jsx";
import { MediaProvider } from "./MediaContext.jsx";
import { ManifestProvider } from "./ManifestContext.jsx";

export const Provider = ({ children }) => {
  return (
    <Router>
      <ReactKeycloakProvider
        authClient={keycloak}
        initOptions={{
          checkLoginIframe: false,
          pkceMethod: 'S256',
          tokenRefreshInterval: 60,
        }}
        LoadingComponent={
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <span className="loading loading-spinner loading-lg"></span>
              <p className="mt-4 text-xl">Loading...</p>
            </div>
          </div>
        }
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
                              <ManifestProvider>
                                {children}
                              </ManifestProvider>
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
    </Router>
  );
};

Provider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default Provider;