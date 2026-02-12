import { Navigate } from "react-router-dom";
import { useAppContext } from "../Context/AppContext";
import Loading from "../CommonComponent/Loading/Loading";

const ProtectedRouteSuper = ({ element: Component, allowedRoles = [] }) => {
  const { isLoading } = useAppContext();

  if (isLoading) return <Loading />;

  const superAdmin = sessionStorage.getItem("super_credentials");

  let currentRole = null;
  let loginRedirect = "/super-admin-login";

  if (superAdmin) {
    currentRole = "SuperAdmin";
    loginRedirect = "/super-admin-login";
  }

  if (!currentRole) {
    return <Navigate to={loginRedirect} replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(currentRole)) {
    return <Navigate to={loginRedirect} replace />;
  }

  return <Component />;
};

export default ProtectedRouteSuper;
