import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useKeycloak } from "@react-keycloak/web";
import { useEvent } from "../contexts/EventContext";

export default function AuthRedirect() {
  const { keycloak, initialized } = useKeycloak();
  const { getEventInfo } = useEvent();
  const navigate = useNavigate();

  useEffect(() => {
    const checkEventAndRedirect = async () => {
      if (initialized && keycloak.authenticated) {
        try {
          // Try to get event info
          const eventData = await getEventInfo();
          
          if (eventData?.id) {
            // Event exists, redirect to instantiate
            navigate('/instantiate', { replace: true });
          } else {
            // No event, redirect to setup
            navigate('/setup', { replace: true });
          }
        } catch (error) {
          console.log("Error during auth redirect:", error);
          // Default to setup on error
          navigate('/setup', { replace: true });
        }
      } else if (initialized && !keycloak.authenticated) {
        // Not authenticated, redirect to home
        navigate('/', { replace: true });
      }
    };

    checkEventAndRedirect();
  }, [initialized, keycloak.authenticated, getEventInfo, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <span className="loading loading-spinner loading-lg"></span>
        <p className="mt-4 text-xl">Checking your account...</p>
      </div>
    </div>
  );
}