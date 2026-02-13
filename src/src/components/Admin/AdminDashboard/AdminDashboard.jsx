import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { FaBars, FaRobot } from "react-icons/fa";
import { useAppContext } from "../../Context/AppContext";
import { toast } from "react-toastify";
import Loading from "../../CommonComponent/Loading/Loading";
import {
  AddAssignForm,
  AddInResolveQuery,
  AIAgentSummaryAPI,
  DeleteQueryForm,
  GetFormDetails,
  ShowCustomerDetails,
  ShowCustomerFormDetails,
} from "../AdminServices/AdminServices";
import FormDetailsModal from "../Modals/FormDetailsModal/FormDetailsModal";
import ConfirmModal from "../Modals/ConfirmModal/ConfirmModal";
import FormDetailsView from "../Modals/FormDetailsModal/FormDetailsModal";
import AdminSidebar from "../AdminSidebar";

import { useTranslation } from "react-i18next";
import AdminHeader from "../AdminHeader/AdminHeader";

const AdminDashboard = () => {
  const ws = useRef(null);
  const { t } = useTranslation();
  const [loadingEmail, setLoadingEmail] = useState(false);
  const { user, handleLogout } = useAppContext();
  const [organizations, setOrganizations] = useState([]);
  const navigate = useNavigate();
  const [selected, setSelected] = useState("");
  const [isloading, setIsLoading] = useState(false);
  const [staticData, setstaticData] = useState(null);
  const [historyData, setHistoryData] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [allCustomers, setAllCustomers] = useState([]);
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [formDetail, setFormDetail] = useState(null);
  const [detailModal, setDetailModal] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [isLoading, setIsLaoding] = useState(false);
  const [isLoadingAssign, setIsLaodingAssign] = useState(false);
  const [aiSummary, setAiSummary] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [openProfile, setOpenProfile] = useState(false);
  const profileRef = useRef(null);

  const toggleLeftSidebar = () => {
    setLeftSidebarOpen((prev) => !prev);
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setOpenProfile(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchAllCustomers = async () => {
    setIsLoading(true);
    try {
      const data = await GetFormDetails();

      setAllCustomers(data || []);
    } catch (err) {
      if (err?.response?.status === 401) handleLogout();
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllCustomers();
  }, []);

  const handleSendEmail = async () => {
    if (!selected) return;
    setLoadingEmail(true);
    try {
      const payload = { file_id: selected };
      const res = await ChatTwoSendMailConversation(payload);
      console.log("Email sent successfully:", res);
      toast.success("Chat history sent to your email successfully");
    } catch (err) {
      if (err?.response?.status === 401) handleLogout();
      console.log("Failed to send email:", err);
    } finally {
      setLoadingEmail(false);
    }
  };

  const handleSelectRow = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === allCustomers.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(allCustomers.map((item) => item.id));
    }
  };

  const handleShowDetail = async (form_id, customer_id) => {
    try {
      setLoadingDetail(true);
      setDetailModal(true);

      const [formData, customerData] = await Promise.all([
        ShowCustomerFormDetails(form_id),
        ShowCustomerDetails(customer_id),
      ]);

      setFormDetail(formData);
      setstaticData(customerData);
      setLeftSidebarOpen(true);

      try {
        const aiSummaryRes = await AIAgentSummaryAPI(form_id);
        setAiSummary(aiSummaryRes?.summary_text || null);
      } catch (error) {
        if (error?.response?.status === 404) {
          setAiSummary(null);
        } else {
          console.error("AI summary error:", error);
        }
      }
    } catch (error) {
      if (error?.response?.status === 401) handleLogout();
      console.error("Error loading form details:", error);
    } finally {
      setLoadingDetail(false);
    }
  };

  const toggleHistory = (fileId) => {
    setHistoryData((prev) =>
      prev.map((item) =>
        item.fileId === fileId
          ? { ...item, isCollapsed: !item.isCollapsed }
          : item,
      ),
    );
  };

  const handleAssign = async (form_id) => {
    try {
      setIsLaodingAssign(true);

      const res = await AddAssignForm(form_id);

      toast.success("Form assigned successfully!");

      setAllCustomers((prev) =>
        prev.map((item) =>
          item.id === form_id
            ? {
                ...item,
                from_assigned_admin: res?.assigned_admin ?? "Assigned",
              }
            : item,
        ),
      );
    } catch (err) {
      if (err?.response?.status === 401) handleLogout();
      console.error(err);
    } finally {
      setIsLaodingAssign(false);
    }
  };

  const handleResolve = async (form_id) => {
    try {
      setIsLaoding(true);
      const res = await AddInResolveQuery(form_id);
      toast.success("Submitted resolve successfully!");
      setAllCustomers((prev) =>
        prev.map((item) =>
          item.id === form_id
            ? {
                ...item,
                form_status: res.status,
              }
            : item,
        ),
      );
      setstaticData(null);
    } catch (error) {
      if (err?.response?.status === 401) handleLogout();
      console.error(error);
    } finally {
      setDetailModal(false);
      setIsLaoding(false);
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      setIsDeleting(true);
      if (selectedIds.length > 0) {
        await DeleteQueryForm({
          form_ids: selectedIds,
        });
        setAllCustomers((prev) =>
          prev.filter((item) => !selectedIds.includes(item.id)),
        );
        setSelectedIds([]);
      } else if (deleteId) {
        await DeleteQueryForm({
          form_ids: [deleteId],
        });
        setAllCustomers((prev) => prev.filter((item) => item.id !== deleteId));
      }
      toast.error("Form deleted successfully!");
    } catch (err) {
      if (err?.response?.status === 401) handleLogout();
      console.error(err);
    } finally {
      setIsDeleting(false);
      setDeleteModal(false);
      setDeleteId(null);
    }
  };

  return (
    <div style={{ width: "100%" }}>
      {(isloading || loadingDetail) && <Loading />}
      <div className="back02" onClick={toggleLeftSidebar}>
        <FaBars />
      </div>

      <div className="content-wrapper">
        <AdminSidebar
          isOpen={leftSidebarOpen}
          customerData={staticData}
          detailModal={detailModal}
        />
        <AdminHeader />
        <div
          className={`main admin_main ${!leftSidebarOpen ? "fullwidth" : ""}`}
          id="main-content"
        >
          <div className="heading_sec">
            <FaRobot
              className="me-2"
              style={{ fontSize: "30px", marginTop: "-10px" }}
            />
            <h1>{t("escalationForms")}</h1>
          </div>
          {selectedIds.length > 0 && (
            <div className="d-flex justify-content-between align-items-center mb-3 p-2 bg-light border rounded">
              <span>{selectedIds.length} selected</span>

              <button
                className="btn btn-danger btn-sm"
                onClick={() => setDeleteModal(true)}
              >
                {t("deleteSelected")}
              </button>
            </div>
          )}

          <div className="table-responsive">
            {detailModal ? (
              <FormDetailsView
                formDetail={formDetail}
                loadingDetail={loadingDetail}
                onClose={() => {
                  setDetailModal(false);
                  setFormDetail(null);
                  setstaticData(null);
                }}
                onResolve={handleResolve}
                isLoading={isLoading}
                aiSummary={aiSummary}
              />
            ) : (
              <>
                <table className="table table-striped">
                  <thead className="table-dark">
                    <tr>
                      <th>
                        <input
                          type="checkbox"
                          checked={
                            allCustomers.length > 0 &&
                            selectedIds.length === allCustomers.length
                          }
                          onChange={handleSelectAll}
                        />
                      </th>
                      <th>{t("customerName")}</th>
                      <th>{t("queryTitle")}</th>
                      <th>{t("createdAt")}</th>
                      <th>{t("assignedAdmin")}</th>
                      <th>{t("actions")}</th>
                      <th>{t("status")}</th>
                      <th>{t("delete")}</th>
                    </tr>
                  </thead>

                  <tbody>
                    {allCustomers.length === 0 ? (
                      <tr>
                        <td colSpan="8" className="text-center text-muted">
                          {t("noCustomerForms")}
                        </td>
                      </tr>
                    ) : (
                      allCustomers.map((item) => (
                        <tr key={item.id}>
                          <td>
                            <input
                              type="checkbox"
                              checked={selectedIds.includes(item.id)}
                              onChange={() => handleSelectRow(item.id)}
                            />
                          </td>
                          <td>{item.customer_name}</td>

                          <td>{item.form_title}</td>

                          <td>{new Date(item.created_at).toLocaleString()}</td>

                          <td>
                            {item.from_assigned_admin == null ? (
                              <span
                                className="badge button-color"
                                style={{ cursor: "pointer" }}
                                onClick={() => handleAssign(item.id)}
                              >
                                {isLoadingAssign
                                  ? t("assigning")
                                  : t("assignNow")}
                              </span>
                            ) : (
                              <span
                                className="badge bg-success"
                                title={item.from_assigned_admin}
                                style={{ cursor: "pointer" }}
                              >
                                {t("assigned")}
                              </span>
                            )}
                          </td>

                          <td>
                            <div className="action-buttons">
                              <button
                                style={{
                                  backgroundColor: "#e2e3e5",
                                  color: "#495057",
                                  border: "none",
                                  padding: "4px 14px",
                                  borderRadius: "10px",
                                  fontSize: "12px",
                                  fontWeight: "600",
                                  cursor: "pointer",
                                }}
                                onClick={() => {
                                  handleShowDetail(item.id, item.customer_id);
                                }}
                              >
                                {t("showDetails")}
                              </button>
                            </div>
                          </td>

                          <td>
                            <span
                              className={`badge ${
                                item.form_status === "new"
                                  ? "new-btn"
                                  : "bg-secondary"
                              }`}
                            >
                              {t(item.form_status)}
                            </span>
                          </td>
                          <td>
                            <button
                              className="delete"
                              onClick={() => {
                                setDeleteId(item.id);
                                setDeleteModal(true);
                              }}
                            >
                              {t("delete")}
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>

                <ConfirmModal
                  isOpen={deleteModal}
                  title={t("deleteConfirmationTitle")}
                  message={t("deleteConfirmationMessage")}
                  onCancel={() => setDeleteModal(false)}
                  onConfirm={handleDeleteConfirm}
                />
              </>
            )}
            {isModalOpen && (
              <div
                className="modal fade show"
                style={{ display: "block", background: "rgba(0,0,0,0.5)" }}
              >
                <div className="modal-dialog modal-dialog-centered">
                  <div className="modal-content">
                    <div className="modal-header">
                      <h5 className="modal-title">Organization Details</h5>
                      <button
                        type="button"
                        className="btn-close"
                        onClick={() => setIsModalOpen(false)}
                      ></button>
                    </div>

                    <div className="modal-footer">
                      <button
                        className="btn btn-secondary"
                        onClick={() => {
                          setIsModalOpen(false);
                        }}
                      >
                        {t("close")}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
