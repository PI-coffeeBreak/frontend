import { useKeycloak } from "@react-keycloak/web";
import PropTypes from "prop-types";

const PrivateRoute = ({ children }) => {
    const { keycloak } = useKeycloak();
    const isLoggedIn = keycloak.authenticated;
    return isLoggedIn ? children : null;
};

PrivateRoute.propTypes = {
    children: PropTypes.node.isRequired,
};

export default PrivateRoute;