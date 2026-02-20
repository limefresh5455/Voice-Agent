import React from "react";
import { Link, useLocation } from "react-router-dom";
import { EscalationForm } from "./AdminDashboard/EscalationForm";
import { useTranslation } from "react-i18next";
import { AiOutlineIssuesClose } from "react-icons/ai";
import { SiGoogleforms } from "react-icons/si";
import { RiAdminFill } from "react-icons/ri";
const AdminSidebar = ({ isOpen, customerData, detailModal }) => {
  const { t } = useTranslation();
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <div className={`admin-left-panel ${isOpen ? "open" : "closed"}`}>
      <div className="list-group list-group-flush">
        <Link
          to="/admin-dashboard"
          className={`list-group-item list-group-item-action p-3 ${
            currentPath === "/admin-dashboard" ? "active-link" : ""
          }`}
        >
          <SiGoogleforms /> {t("escalationForm")}
        </Link>
      </div>

      <div className="list-group list-group-flush">
        <Link
          to="/leads"
          className={`list-group-item list-group-item-action p-3 ${
            currentPath === "/leads" ? "active-link" : ""
          }`}
        >
          <RiAdminFill className="admin_icon" /> {t("leads")}
        </Link>
      </div>

      <div className="list-group list-group-flush">
        <Link
          to="/customer-services"
          className={`list-group-item list-group-item-action p-3 ${
            currentPath === "/customer-services" ? "active-link" : ""
          }`}
        >
          <i className="bi bi-gear-fill me-2"></i>
          {t("customerServices")}
        </Link>
      </div>

      <div className="list-group list-group-flush">
        <Link
          to="/admin-customer"
          className={`list-group-item list-group-item-action p-3 ${
            currentPath === "/admin-customer" ? "active-link" : ""
          }`}
        >
          <i className="bi bi-person-lines-fill me-2"></i>
          {t("customersClients")}
        </Link>
      </div>

      <div className="list-group list-group-flush">
        <Link
          to="/non-customer-facing-data"
          className={`list-group-item list-group-item-action p-3 ${
            currentPath === "/non-customer-facing-data" ? "active-link" : ""
          }`}
        >
          <AiOutlineIssuesClose className="admin_icon" />{" "}
          {t("nonCustomerFacingData")}
        </Link>
      </div>

      {detailModal && <EscalationForm customerData={customerData} />}
      <div className="list-group list-group-flush mt-3 logout_btn_wrapper">
        <Link
          to="/logout"
          className="list-group-item list-group-item-action p-3 logout text-danger"
        >
          <i className="bi bi-box-arrow-right me-2 text-danger"></i>{" "}
          {t("logout")}
        </Link>
      </div>
    </div>
  );
};

export default AdminSidebar;
