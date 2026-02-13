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
              to="/user-dashboard"
              className={`list-group-item list-group-item-action p-3 ${
                currentPath === "/user-dashboard" ? "active-link" : ""
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
              <FaUser className="admin_icon" />
              Customers
            </Link>
          </div>
        </>
      )}

      {user?.role === "user" && (
        <>
          <div className="list-group list-group-flush">
            <Link
              to="/resolutions"
              className={`list-group-item list-group-item-action p-3 ${
                currentPath === "/resolutions" ? "active-link" : ""
              }`}
            >
              <AiOutlineIssuesClose className="admin_icon" /> Issues
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
