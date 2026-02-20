import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAppContext } from "../../Context/AppContext";
import { useLocation } from "react-router-dom";
import { RiAdminFill } from "react-icons/ri";
import { FaUser } from "react-icons/fa";
import { AiOutlineIssuesClose } from "react-icons/ai";

const Sidebar = ({ isOpen }) => {
  const [showHistory, setShowHistory] = useState(false);
  const [openUser, setOpenUser] = useState(null);
  const [activeTab, setActiveTab] = useState("customerDetails");

  const { user, handleLogout } = useAppContext();
  const location = useLocation();
  const currentPath = location.pathname;
  const toggleHistory = () => {
    setShowHistory((prev) => !prev);
    setOpenUser(null);
    setActiveTab("customerDetails");
  };

  return (
    <div
      className={`bg-white sidebar-wrapper ${isOpen ? "" : ""}`}
      id="sidebar-wrapper"
      style={{
        maxHeight: "100vh",
        overflowY: "auto",
      }}
    >
      {user?.role === "SuperAdmin" && (
        <div className="list-group list-group-flush">
          <Link
            to="/super-admin-dashboard"
            className={`list-group-item list-group-item-action p-3 ${
              currentPath === "/super-admin-dashboard" ? "active-link" : ""
            }`}
          >
            <i className="bi bi-person-lines-fill me-2"></i> Organizations
          </Link>
        </div>
      )}

      {user?.role === "user" && (
        <>
          <div className="list-group list-group-flush">
            <Link
              to="/organization-dashboard"
              className={`list-group-item list-group-item-action p-3 ${
                currentPath === "/organization-dashboard" ? "active-link" : ""
              }`}
            >
              <RiAdminFill className="admin_icon" /> Admins
            </Link>
          </div>
        </>
      )}
      {user?.role === "user" && (
        <>
          <div className="list-group list-group-flush">
            <Link
              to="/customers"
              className={`list-group-item list-group-item-action p-3 ${
                currentPath === "/customers" ? "active-link" : ""
              }`}
            >
              <i className="bi bi-person-lines-fill me-2"></i>
              Customers/Clients
            </Link>
          </div>
        </>
      )}

      {user?.role === "user" && (
        <>
          <div className="list-group list-group-flush">
            <Link
              to="/customer-client-general-data"
              className={`list-group-item list-group-item-action p-3 ${
                currentPath === "/customer-client-general-data"
                  ? "active-link"
                  : ""
              }`}
            >
              <AiOutlineIssuesClose className="admin_icon" /> Customer/Client
              General Data
            </Link>
          </div>
        </>
      )}

      <div className="list-group list-group-flush mt-3">
        <Link
          to="/logout"
          className="list-group-item list-group-item-action p-3 logout text-danger"
        >
          <i className="bi bi-box-arrow-right me-2 text-danger"></i> Log Out
        </Link>
      </div>
    </div>
  );
};

export default Sidebar;
