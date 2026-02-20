import React, { useEffect, useState } from "react";
import AdminSidebar from "../AdminSidebar";
import Loading from "../../CommonComponent/Loading/Loading";
import { FaBars, FaRobot } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import AdminHeader from "../AdminHeader/AdminHeader";
import {
  AddAssignLeadForm,
  deleteLead,
  GetAllLeads,
  GetLeadFormDetails,
  ResolveLeadQuery,
} from "../AdminServices/AdminServices";
import ConfirmDeleteModal from "../../CommonComponent/ConfirmDeleteModal/ConfirmDeleteModal";
import LeadDetailModal from "./LeadDetailModal";
import { toast } from "react-toastify";
import { MdDelete } from "react-icons/md";

function Leads() {
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(true);
  const [isloading, setIsLoading] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [leads, setLeads] = useState([]);
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleteCustomerId, setDeleteCustomerId] = useState(null);
  const { t } = useTranslation();
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [assigningLeadIds, setAssigningLeadIds] = useState([]);
  const [resolvingLeadIds, setResolvingLeadIds] = useState([]);
  const [selectedLeadIds, setSelectedLeadIds] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [deletingLeadIds, setDeletingLeadIds] = useState([]);
  const [isDeleting, setIsDeleting] = useState(false);

  const pageSize = 20;

  const toggleLeftSidebar = () => {
    setLeftSidebarOpen((prev) => !prev);
  };

  const fetchLeads = async (page = 1) => {
    try {
      setIsLoading(true);
      const res = await GetAllLeads(page, pageSize);
      if (res.status === 200) {
        const responseData = res.data;
        setLeads(responseData.data || []);
        setTotalCount(responseData.total || 0);
        setTotalPages(responseData.total_pages || 1);
        setCurrentPage(responseData.page || 1);
      }
    } catch (error) {
      console.error(error);
      setLeads([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads(currentPage);
  }, [currentPage]);

  const handleOpenDeleteModal = (id) => {
    setDeleteCustomerId(id);
    setDeleteModal(true);
  };

  const handleDeleteLeads = async () => {
    let leadsToDelete = [];

    if (selectedLeadIds.length > 0) {
      leadsToDelete = [...selectedLeadIds];
    } else if (deleteCustomerId) {
      leadsToDelete = [deleteCustomerId];
    }

    try {
      setIsDeleting(true);
      await deleteLead({ lead_ids: leadsToDelete });

      setLeads((prev) =>
        prev.filter((lead) => !leadsToDelete.includes(lead.id)),
      );
      setSelectedLeadIds([]);
      toast.success(t("leadDeletedSuccess"));
    } catch (error) {
      console.error(error);
      toast.error(t("deleteFailed"));
    } finally {
      setIsDeleting(false);
      setDeleteModal(false);
      setDeleteCustomerId(null);
    }
  };

  const handleShowDetails = async (id) => {
    try {
      setLoadingDetail(true);
      const res = await GetLeadFormDetails(id);
      setSelectedLead(res?.data);
      setShowDetailModal(true);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleAssignAdmin = async (leadId) => {
    try {
      setAssigningLeadIds((prev) => [...prev, leadId]);
      await AddAssignLeadForm(leadId);
      toast.success(t("assignedSuccess"));
      fetchLeads();
    } catch (err) {
      console.error("Assign lead error:", err);
      toast.error(t("assignFailed"));
    } finally {
      setAssigningLeadIds((prev) => prev.filter((id) => id !== leadId));
    }
  };

  const handleResolveLead = async (leadId) => {
    try {
      setResolvingLeadIds((prev) => [...prev, leadId]);
      const res = await ResolveLeadQuery(leadId);
      toast.success(t("resolveSuccess"));
      setLeads((prev) =>
        prev.map((lead) =>
          lead.id === leadId
            ? {
                ...lead,
                form_status: res.status || "resolved",
              }
            : lead,
        ),
      );
      setShowDetailModal(false);
      setSelectedLead(null);
    } catch (error) {
      console.error(error);
      toast.error(t("resolveQueryFailed"));
    } finally {
      setResolvingLeadIds((prev) => prev.filter((id) => id !== leadId));
    }
  };

  const handleSelectRow = (id) => {
    setSelectedLeadIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const handleSelectAll = () => {
    if (selectedLeadIds.length === leads.length) {
      setSelectedLeadIds([]);
    } else {
      setSelectedLeadIds(leads.map((lead) => lead.id));
    }
  };

  return (
    <div style={{ width: "100%" }}>
      {(isloading || loadingDetail) && <Loading />}
      <div className="content-wrapper">
        <div className="back02" onClick={toggleLeftSidebar}>
          <FaBars />
        </div>
        <AdminSidebar isOpen={leftSidebarOpen} />
        <AdminHeader />
        <div
          className={`main admin_main ${!leftSidebarOpen ? "fullwidth" : ""}`}
          id="main-content"
        >
          <div className="heading_sec">
            {/* <FaRobot
              className="me-2"
              style={{ fontSize: "30px", marginTop: "-10px" }}
            /> */}
            <h3 className="admin_head">{t("connectToLeads")}</h3>
          </div>
          {selectedLeadIds.length > 0 && (
            <div className="d-flex justify-content-between align-items-center mb-3 p-2 bg-light border rounded">
              <span>{selectedLeadIds.length} selected</span>

              <button className="delete" onClick={() => setDeleteModal(true)}>
                <MdDelete />
                {t("delete")}
              </button>
            </div>
          )}

          <div className="table-responsive">
            <table className="table table-striped">
              <thead className="table-dark">
                <tr>
                  <th>
                    <input
                      type="checkbox"
                      checked={
                        leads.length > 0 &&
                        selectedLeadIds.length === leads.length
                      }
                      onChange={handleSelectAll}
                    />
                  </th>
                  <th>{t("customerName")}</th>
                  <th>{t("email")}</th>
                  <th>{t("createdAt")}</th>
                  <th>{t("priority")}</th>
                  <th>{t("assignedAdmin")}</th>
                  <th>{t("details")}</th>
                  <th>{t("status")}</th>
                  <th>{t("delete")}</th>
                </tr>
              </thead>
              <tbody>
                {leads.length > 0 ? (
                  leads.map((lead) => (
                    <tr key={lead.id}>
                      <td>
                        <input
                          type="checkbox"
                          checked={selectedLeadIds.includes(lead.id)}
                          onChange={() => handleSelectRow(lead.id)}
                        />
                      </td>
                      <td>{lead.name}</td>
                      <td>{lead.email}</td>

                      <td>
                        {new Date(lead.created_at).toLocaleDateString("en-IN")}
                      </td>
                      <td>{lead.priority}</td>
                      <td>
                        {lead.assigned_admin == null ? (
                          <span
                            className="badge button-color"
                            style={{ cursor: "pointer" }}
                            onClick={() => handleAssignAdmin(lead.id)}
                          >
                            {assigningLeadIds.includes(lead.id)
                              ? t("assigning")
                              : t("assignNow")}
                          </span>
                        ) : (
                          <span
                            className="badge bg-success"
                            title={lead.assigned_admin}
                            style={{ cursor: "pointer" }}
                          >
                            {t("assigned")}
                          </span>
                        )}
                      </td>

                      <td>
                        <button
                          className="show_detail_btn"
                          onClick={() => handleShowDetails(lead.id)}
                        >
                          {t("showDetails")}
                        </button>
                      </td>

                      <td>
                        <span
                          className={`badge ${
                            lead.form_status === "new"
                              ? "new-btn"
                              : lead.form_status === "resolved"
                                ? "bg-success"
                                : "bg-secondary"
                          }`}
                        >
                          {t(lead.form_status)}
                        </span>
                      </td>

                      <td>
                        <button
                          className="delete"
                          onClick={() => handleOpenDeleteModal(lead.id)}
                          disabled={
                            selectedLeadIds.length > 0 ||
                            deletingLeadIds.includes(lead.id)
                          }
                          style={{
                            cursor:
                              selectedLeadIds.length > 0
                                ? "not-allowed"
                                : "pointer",
                          }}
                        >
                          {deletingLeadIds.includes(lead.id) ? (
                            t("deleting")
                          ) : (
                            <MdDelete />
                          )}
                          {t("delete")}
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="9" className="text-center">
                      {t("noLeadsFound")}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            <div className="d-flex justify-content-center mt-4">
              <nav>
                <ul className="pagination custom-pagination">
                  <li
                    className={`page-item ${currentPage === 1 ? "disabled" : ""}`}
                  >
                    <button
                      className="page-link"
                      onClick={() => setCurrentPage((prev) => prev - 1)}
                    >
                      ‹
                    </button>
                  </li>

                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(
                      (page) =>
                        page >= currentPage - 1 && page <= currentPage + 1,
                    )
                    .map((page) => (
                      <li
                        key={page}
                        className={`page-item ${
                          currentPage === page ? "active" : ""
                        }`}
                      >
                        <button
                          className="page-link"
                          onClick={() => setCurrentPage(page)}
                        >
                          {page}
                        </button>
                      </li>
                    ))}

                  <li
                    className={`page-item ${
                      currentPage === totalPages ? "disabled" : ""
                    }`}
                  >
                    <button
                      className="page-link"
                      onClick={() => setCurrentPage((prev) => prev + 1)}
                    >
                      ›
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          </div>
          {showDetailModal && (
            <div
              className={`content-modal ${
                leftSidebarOpen ? "with-sidebar" : "no-sidebar"
              }`}
            >
              <LeadDetailModal
                show={showDetailModal}
                data={selectedLead}
                onClose={() => setShowDetailModal(false)}
                onResolve={handleResolveLead}
                resolvingIds={resolvingLeadIds}
              />
            </div>
          )}
          <ConfirmDeleteModal
            show={deleteModal}
            message={t("deleteLeadConfirm")}
            onConfirm={handleDeleteLeads}
            onCancel={() => {
              setDeleteModal(false);
              setDeleteCustomerId(null);
            }}
            isDeleting={isDeleting}
          />
        </div>
      </div>
    </div>
  );
}

export default Leads;
