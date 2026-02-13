import { Navigate } from "react-router-dom";
import { useAppContext } from "../Context/AppContext";
import Loading from "../CommonComponent/Loading/Loading";

const ProtectedRouteUser = ({ element: Component, allowedRoles = [] }) => {
  const { isLoading } = useAppContext();

  if (isLoading) return <Loading />;

  const user = sessionStorage.getItem("user_credentials");

  let currentRole = null;
  let loginRedirect = "/organization-login";
  if (user) {
    currentRole = "user";
    loginRedirect = "/organization-login";
  }

  if (!currentRole) {
    return <Navigate to={loginRedirect} replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(currentRole)) {
    return <Navigate to={loginRedirect} replace />;
  }

  return <Component />;
};

export default ProtectedRouteUser;
