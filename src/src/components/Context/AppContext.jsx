import React, { createContext, useContext, useState, useEffect } from "react";

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    const adminCred = JSON.parse(sessionStorage.getItem("admin_credentials"));
    const userCred = JSON.parse(sessionStorage.getItem("user_credentials"));
    const superCred = JSON.parse(sessionStorage.getItem("super_credentials"));

    if (adminCred) setUser(adminCred);
    else if (userCred) setUser(userCred);
    else if (superCred) setUser(superCred);

    setIsLoading(false);
  }, []);

  const handleLogout = (navigate) => {
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

    setUser(null);
  };

  return (
    <AppContext.Provider
      value={{
        user,
        setUser,
        isLoading,
        setIsLoading,
        theme,
        setTheme,
        handleLogout,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
