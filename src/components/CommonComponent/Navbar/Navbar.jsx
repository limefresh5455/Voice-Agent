import React, { useEffect, useState, useRef } from "react";

import { useAppContext } from "../../Context/AppContext";
import { useNavigate } from "react-router-dom";

const Navbar = ({ onToggleSidebar }) => {
  const { user, handleLogout } = useAppContext();
  const [username, setUsername] = useState(null);

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const superAdminStored = sessionStorage.getItem("super_credentials");
    const adminStored = sessionStorage.getItem("admin_credentials");
    const userStored = sessionStorage.getItem("user_credentials");

    if (superAdminStored) {
      const data = JSON.parse(superAdminStored);
      if (data.role) setUsername(data.role); // Superadmin name
    } else if (adminStored) {
      const data = JSON.parse(adminStored);
      if (data.admin_name) setUsername(data.admin_name); // Admin name
    } else if (userStored) {
      const data = JSON.parse(userStored);
      if (data.organization_name) {
        setUsername(data.organization_name); // User org name
      } else if (data.role) {
        setUsername(data.role.charAt(0).toUpperCase() + data.role.slice(1));
      }
    }
  }, []);

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light d-flex align-items-center">
      <div className="d-flex justify-content-between gap-lg-5 align-items-center">
        <div className="sidebar-heading">
          <span className="logo_txt">TranScript App</span>
        </div>
        <button
          className="btn btn-link text-secondary mt-0 toggle_btn"
          onClick={onToggleSidebar}
        >
          <i className="bi bi-list fs-3"></i>
        </button>
      </div>
      <ul className="navbar-nav ms-auto mt-lg-0 d-flex flex-row align-items-center">
        <li className="nav-item position-relative" ref={dropdownRef}>
          <button
            className="nav-link text-secondary fw-bold ms-3 bg-transparent border-0 d-flex align-items-center"
            onClick={() => setIsOpen(!isOpen)}
          >
            <i className="bi bi-person-circle fs-5 me-1"></i>
            {username && (
              <span className="user-name text-muted ms-1">{username}</span>
            )}
          </button>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;
