import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../../Context/AppContext";
import Loading from "../Loading/Loading";

const Logout = () => {
  const navigate = useNavigate();
  const { setUser, setIsLoading } = useAppContext();

  useEffect(() => {
    const handleLogout = () => {
      setIsLoading(true);

      const stored_admin = sessionStorage.getItem("admin_credentials");
      const stored_user = sessionStorage.getItem("user_credentials");
      const stored_super = sessionStorage.getItem("super_credentials");

      if (stored_admin) {
        sessionStorage.removeItem("admin_credentials");

        navigate("/admin-login", { replace: true });
      } else if (stored_user) {
        sessionStorage.removeItem("user_credentials");
        navigate("/organization-login", { replace: true });
      } else if (stored_super) {
        sessionStorage.removeItem("super_credentials");
        navigate("/super-admin-login", { replace: true });
      }

      setIsLoading(false);

      setUser(null);
    };

    handleLogout();
  }, []);

  return <Loading />;
};

export default Logout;
