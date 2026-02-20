import React, { useEffect, useRef, useState } from "react";

import Loading from "../../CommonComponent/Loading/Loading";

import { toast } from "react-toastify";

import ConfirmDeleteModal from "../../CommonComponent/ConfirmDeleteModal/ConfirmDeleteModal";

import { MdModeEdit, MdDelete } from "react-icons/md";
import { AiOutlineIssuesClose } from "react-icons/ai";

import {
  deleteIssue,
  GetGeneralData,
  GetIssues,
  ShowIssuesDetail,
  UpdateIssues,
  UploadIssuesFile,
} from "../../User/UserServices/UserServices";

import { useTranslation } from "react-i18next";
import { FaBars } from "react-icons/fa";
import AdminSidebar from "../AdminSidebar";
import AdminHeader from "../AdminHeader/AdminHeader";
import CsvMappingModal from "../../CommonComponent/CSVMappingModal/CsvMappingModal";
import AddIssueModal from "../../CommonComponent/AddIssueModal/AddIssueModal";
import EditIssueModal from "../../CommonComponent/EditIssueModal/EditIssueModal";
import IssueDetailsModal from "../../CommonComponent/IssueDetailsModal/IssueDetailsModal";

const NonCustomerFacingData = () => {
  const [isloading, setIsLoading] = useState(false);
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const { t } = useTranslation();
  const toggleLeftSidebar = () => {
    setLeftSidebarOpen((prev) => !prev);
  };
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalData, setModalData] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleteModal, setDeleteModal] = useState(false);
  const user = JSON.parse(sessionStorage.getItem("admin_credentials"));
  const role = user?.role;
  const org_id = user?.org_id;
  const admin_id = user?.admin;
  const organizationId = role === "admin" ? org_id : admin_id;
  const [editModalData, setEditModalData] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editModalLoading, setEditModalLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddIssueModal, setShowAddIssueModal] = useState(false);
  const [showMappingModal, setShowMappingModal] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkEditIndex, setBulkEditIndex] = useState(0);
  const bulkUpdateRef = useRef([]);
  const [isBulkEditing, setIsBulkEditing] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [currentMappingIndex, setCurrentMappingIndex] = useState(0);
  const rowsPerPage = 20;

  const fetchIssues = async (page = 1) => {
    try {
      setLoading(true);
      const res = await GetGeneralData(org_id, page, rowsPerPage);
      if (res.status === 200) {
        const responseData = res.data;
        setIssues(responseData.data || []);
        setTotalCount(responseData.total || 0);
        setTotalPages(responseData.total_pages || 1);
        setCurrentPage(responseData.page || 1);
      }
    } catch (error) {
      console.error("API ERROR", error?.response || error);
      toast.error("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!org_id && !admin_id) return;
    fetchIssues(currentPage);
  }, [org_id, admin_id, currentPage]);

  const fileInputRef = useRef(null);
  const handleAddIssuesClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    try {
      for (let file of files) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("data_type", "issue");
        await UploadIssuesFile(formData);
      }
      toast.success("File(s) uploaded successfully");
      setCurrentPage(1);
      await fetchIssues(1);
    } catch (error) {
      console.error(error.response?.data || error);
      toast.error("Upload failed");
    }
    e.target.value = "";
  };

  const handleShowDetails = async (row_id) => {
    const user = JSON.parse(sessionStorage.getItem("admin_credentials"));
    const organization_id = user?.org_id;

    try {
      setModalLoading(true);
      setShowModal(true);
      const res = await ShowIssuesDetail(row_id, organization_id);
      console.log(res, "show response");
      setModalData(res.data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch issue details");
    } finally {
      setModalLoading(false);
    }
  };

  const handleEdit = async (issue_id) => {
    try {
      setEditModalLoading(true);
      setShowEditModal(true);

      const res = await ShowIssuesDetail(issue_id, organizationId);
      setEditModalData(res);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch issue details");
    } finally {
      setEditModalLoading(false);
    }
  };

  const handleSaveEdit = async (updatedData) => {
    try {
      if (isBulkEditing && selectedIds.length > 0) {
        bulkUpdateRef.current.push(updatedData);

        if (bulkEditIndex < selectedIds.length - 1) {
          const nextIndex = bulkEditIndex + 1;
          setBulkEditIndex(nextIndex);
          handleEdit(selectedIds[nextIndex]);
          return;
        } else {
          await UpdateIssues(bulkUpdateRef.current);
          toast.success("All issues updated successfully!");
          bulkUpdateRef.current = [];
          setSelectedIds([]);
          setIsBulkEditing(false);
          setShowEditModal(false);
          fetchIssues();
        }
      } else {
        await UpdateIssues([updatedData]);
        toast.success(t("issueUpdatedSuccess"));
        setShowEditModal(false);
        fetchIssues();
      }
    } catch (error) {
      console.error(error);
      toast.error(t("updateFailed"));
    }
  };

  useEffect(() => {
    const isAnyModalOpen =
      showModal || showEditModal || deleteModal || showAddIssueModal;

    if (isAnyModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [showModal, showEditModal, deleteModal, showAddIssueModal]);

  const handleIssueAdded = async () => {
    await fetchIssues();
    setCurrentPage(1);
  };

  const handleSelectRow = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === issues.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(issues.map((item) => item.issue_id));
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
          <div className="container-fluid px-0 pt-0">
            <div className="d-flex justify-content-between align-items-center  mb-4 mt-3 flex-wrap">
              <h3 className="admin_head mb-0">{t("createIssues")}</h3>

              <div className="action-header-btns">
                <button
                  className="issue-primary-action-btn"
                  onClick={() => setShowAddIssueModal(true)}
                >
                  + {t("addIssue")}
                </button>

                <button
                  className="issue-primary-action-btn"
                  onClick={handleAddIssuesClick}
                >
                  <AiOutlineIssuesClose className="btn-icon" />
                  {t("uploadFile")}
                </button>

                <input
                  type="file"
                  accept=".json,application/json,.csv,text/csv"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  style={{ display: "none" }}
                  multiple
                />
              </div>
            </div>
            {selectedIds.length > 0 && (
              <div className="d-flex justify-content-between align-items-center mb-3 p-2 bg-light border rounded">
                <span>
                  {selectedIds.length} {t("selected")}
                </span>

                <div className="d-flex gap-2">
                  <button
                    className="customer_edit_btn"
                    onClick={() => {
                      if (selectedIds.length > 0) {
                        setIsBulkEditing(true);
                        setBulkEditIndex(0);
                        handleEdit(selectedIds[0]);
                      }
                    }}
                  >
                    <MdModeEdit />
                    {t("edit")}
                  </button>

                  <button
                    className="delete"
                    onClick={() => setDeleteModal(true)}
                  >
                    <MdDelete />
                    {t("delete")}
                  </button>
                </div>
              </div>
            )}

            <div className="table-responsive">
              <table className="table table-striped table_resolution">
                <thead className="table-dark">
                  <tr>
                    <th>
                      <input
                        type="checkbox"
                        checked={
                          issues.length > 0 &&
                          selectedIds.length === issues.length
                        }
                        onChange={handleSelectAll}
                      />
                    </th>
                    <th>Category</th>
                    <th>Issues</th>
                    <th>Suggestion Time</th>
                    <th>Router Call</th>
                    <th>Details</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="6" className="text-center">
                        Loading...
                      </td>
                    </tr>
                  ) : issues.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="text-center">
                        No issues found
                      </td>
                    </tr>
                  ) : (
                    issues.map((item, index) => (
                      <tr key={item.row_id || index}>
                        <td>
                          <input
                            type="checkbox"
                            checked={selectedIds.includes(item.row_id)}
                            onChange={() => handleSelectRow(item.row_id)}
                          />
                        </td>
                        <td>{item.Category}</td>
                        <td>{item.Issue}</td>
                        <td>{item.Suggestion_Time || "-"}</td>
                        <td>{item.Router_Call || "NA"}</td>

                        <td>
                          <button
                            className="show_detail_btn"
                            onClick={() => handleShowDetails(item.row_id)}
                          >
                            Show Details
                          </button>
                        </td>
                        <td>
                          <div className="action_customer_btn">
                            <button
                              className="customer_edit_btn"
                              disabled={selectedIds.length > 0}
                              style={{
                                cursor:
                                  selectedIds.length > 0
                                    ? "not-allowed"
                                    : "pointer",
                              }}
                              onClick={() => handleEdit(item.row_id)}
                            >
                              <MdModeEdit /> Edit
                            </button>

                            <button
                              className="delete"
                              disabled={selectedIds.length > 0}
                              style={{
                                cursor:
                                  selectedIds.length > 0
                                    ? "not-allowed"
                                    : "pointer",
                              }}
                              onClick={() => {
                                setDeleteId(item.row_id);
                                setDeleteModal(true);
                              }}
                            >
                              <MdDelete /> Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

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

                  <li
                    className={`page-item ${currentPage === 1 ? "active" : ""}`}
                  >
                    <button
                      className="page-link"
                      onClick={() => setCurrentPage(1)}
                    >
                      1
                    </button>
                  </li>

                  {currentPage > 3 && (
                    <li className="page-item disabled">
                      <span className="page-link">...</span>
                    </li>
                  )}

                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(
                      (page) =>
                        page !== 1 &&
                        page !== totalPages &&
                        page >= currentPage - 1 &&
                        page <= currentPage + 1,
                    )
                    .map((page) => (
                      <li
                        key={page}
                        className={`page-item ${currentPage === page ? "active" : ""}`}
                      >
                        <button
                          className="page-link"
                          onClick={() => setCurrentPage(page)}
                        >
                          {page}
                        </button>
                      </li>
                    ))}

                  {currentPage < totalPages - 2 && (
                    <li className="page-item disabled">
                      <span className="page-link">...</span>
                    </li>
                  )}

                  {totalPages > 1 && (
                    <li
                      className={`page-item ${
                        currentPage === totalPages ? "active" : ""
                      }`}
                    >
                      <button
                        className="page-link"
                        onClick={() => setCurrentPage(totalPages)}
                      >
                        {totalPages}
                      </button>
                    </li>
                  )}

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
        </div>
        <IssueDetailsModal
          show={showModal}
          loading={modalLoading}
          data={modalData}
          onClose={() => setShowModal(false)}
        />
        <EditIssueModal
          show={showEditModal}
          loading={editModalLoading}
          data={editModalData ? editModalData.data : null}
          onClose={() => setShowEditModal(false)}
          onSave={handleSaveEdit}
          isBulkEditing={isBulkEditing}
        />

        <ConfirmDeleteModal
          show={deleteModal}
          message="Are you sure you want to delete selected issue(s)?"
          isDeleting={isDeleting}
          onConfirm={async () => {
            try {
              setIsDeleting(true);

              if (selectedIds.length > 0) {
                await deleteIssue({
                  row_ids: selectedIds,
                });

                setIssues((prev) =>
                  prev.filter((issue) => !selectedIds.includes(issue.row_id)),
                );

                setSelectedIds([]);
              } else if (deleteId) {
                await deleteIssue({
                  row_ids: [deleteId],
                });

                setIssues((prev) =>
                  prev.filter((issue) => issue.row_id !== deleteId),
                );
              }

              toast.error("Issue deleted successfully!");
            } catch (error) {
              toast.error("Failed to delete issue!");
              console.error(error);
            } finally {
              setIsDeleting(false);
              setDeleteModal(false);
              setDeleteId(null);
            }
          }}
          onCancel={() => {
            if (!isDeleting) {
              setDeleteModal(false);
              setDeleteId(null);
            }
          }}
        />

        <AddIssueModal
          show={showAddIssueModal}
          onClose={() => setShowAddIssueModal(false)}
          organization={org_id}
          onIssueAdded={handleIssueAdded}
        />
      </div>
    </div>
  );
};

export default NonCustomerFacingData;
