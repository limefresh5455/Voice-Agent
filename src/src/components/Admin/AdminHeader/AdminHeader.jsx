import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../../Context/AppContext";
import LanguageDropdown from "../../CommonComponent/LanguageDropdown";
import { FaBars, FaRobot } from "react-icons/fa";

const AdminHeader = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAppContext();
  const [openProfile, setOpenProfile] = useState(false);
  const profileRef = useRef(null);
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setOpenProfile(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header>
      <div className="admin-header">
        <div className="row">
          <div className="col-12 d-flex justify-content-end">
            <div className="admin_info text-end">
              <LanguageDropdown />

              <div className="text-end">
                {user?.org_name && (
                  <div className="text-muted small">
                    <strong>{t("organization")}:</strong> {user.org_name}
                  </div>
                )}
                {user?.admin_name && (
                  <div className="text-muted small">
                    <strong>{t("admin")}:</strong> {user.admin_name}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
