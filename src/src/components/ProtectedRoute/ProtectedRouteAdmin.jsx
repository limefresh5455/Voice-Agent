import { Navigate } from "react-router-dom";
import { useAppContext } from "../Context/AppContext";
import Loading from "../CommonComponent/Loading/Loading";

const ProtectedRouteAdmin = ({ element: Component, allowedRoles = [] }) => {
  const { isLoading } = useAppContext();

  if (isLoading) return <Loading />;

  const admin = sessionStorage.getItem("admin_credentials");

  let currentRole = null;
  let loginRedirect = "/admin-login";

  if (admin) {
    currentRole = "admin";
    loginRedirect = "/admin-login";
  }

  if (!currentRole) {
    return <Navigate to={loginRedirect} replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(currentRole)) {
    return <Navigate to={loginRedirect} replace />;
  }

  return <Component />;
};

export default ProtectedRouteAdmin;
