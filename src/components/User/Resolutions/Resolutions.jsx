import React, { useEffect, useRef, useState } from "react";
import Sidebar from "../../CommonComponent/SideBar/SideBar";
import Navbar from "../../CommonComponent/Navbar/Navbar";
import Loading from "../../CommonComponent/Loading/Loading";

import {
  deleteIssue,
  GetIssues,
  ShowIssuesDetail,
  UploadIssuesFile,
} from "../UserServices/UserServices";
import { toast } from "react-toastify";
import IssueDetailsModal from "./ResolutionsFormModal/IssueDetailsModal";
import ConfirmDeleteModal from "../../CommonComponent/ConfirmDeleteModal/ConfirmDeleteModal";
import EditIssueModal from "./EditIssueModal";
import { MdModeEdit, MdDelete } from "react-icons/md";
import { AiOutlineIssuesClose } from "react-icons/ai";
import AddIssueModal from "./AddIssueModal";
import CsvMappingModal from "./CsvMappingModal";

function Resolutions() {
  const [isOpen, setIsOpen] = useState(true);
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalData, setModalData] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleteModal, setDeleteModal] = useState(false);
  const user = JSON.parse(sessionStorage.getItem("user_credentials"));
  const [editModalData, setEditModalData] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editModalLoading, setEditModalLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddIssueModal, setShowAddIssueModal] = useState(false);
  const [showMappingModal, setShowMappingModal] = useState(false);
  const [uploadedFileData, setUploadedFileData] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const rowsPerPage = 5;
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentIssues = issues.slice(indexOfFirstRow, indexOfLastRow);
  const totalPages = Math.ceil(issues.length / rowsPerPage);
  const getPagination = (current, total) => {
    const delta = 2;
    const pages = [];
    for (let i = 1; i <= total; i++) {
      if (
        i === 1 ||
        i === total ||
        (i >= current - delta && i <= current + delta)
      ) {
        pages.push(i);
      }
    }
    const result = [];
    let last = null;
    for (let page of pages) {
      if (last) {
        if (page - last === 2) {
          result.push(last + 1);
        } else if (page - last > 2) {
          result.push("...");
        }
      }
      result.push(page);
      last = page;
    }

    return result;
  };
  const organization_id = user?.organization;
  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };
  const fetchIssues = async () => {
    try {
      setLoading(true);
      const data = await GetIssues(organization_id);
      setIssues(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("API ERROR", error?.response || error);
      toast.error("Failed to fetch issues");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!organization_id) return;
    fetchIssues();
  }, [organization_id]);
  const fileInputRef = useRef(null);
  const handleAddIssuesClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedTypes = ["application/json", "text/csv"];
    const allowedExtensions = [".json", ".csv"];
    const fileExtension = file.name
      .slice(file.name.lastIndexOf("."))
      .toLowerCase();

    if (
      !allowedTypes.includes(file.type) &&
      !allowedExtensions.includes(fileExtension)
    ) {
      toast.error("Only JSON or CSV files are allowed");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await UploadIssuesFile(formData);

      toast.success("File uploaded successfully");

      setUploadedFileData({
        ...res.data,
        file: file,
      });

      setShowMappingModal(true);
    } catch (error) {
      toast.error("Upload failed");
      console.log(error);
    }

    e.target.value = "";
  };

  const handleShowDetails = async (issue_id) => {
    const user = JSON.parse(sessionStorage.getItem("user_credentials"));
    const organization_id = user?.organization;

    try {
      setModalLoading(true);
      setShowModal(true);

      const res = await ShowIssuesDetail(issue_id, organization_id);
      console.log(res, "show response");
      setModalData(res.data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch issue details");
    } finally {
      setModalLoading(false);
    }
  };
  const handleDelete = async (issue_id) => {
    try {
      await deleteIssue(issue_id);
      toast.error("Issue deleted successfully");
      fetchIssues();
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete issue");
    }
  };

  const handleEdit = async (issue_id) => {
    const user = JSON.parse(sessionStorage.getItem("user_credentials"));
    const organization_id = user?.organization;

    try {
      setEditModalLoading(true);
      setShowEditModal(true);

      const res = await ShowIssuesDetail(issue_id, organization_id);
      setEditModalData(res);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch issue details");
    } finally {
      setEditModalLoading(false);
    }
  };

  const handleSaveEdit = async (updatedData) => {
    console.log("Updated data:", updatedData);
    toast.success("Issue updated successfully (demo)");
    fetchIssues();
  };

  useEffect(() => {
    const isAnyModalOpen =
      showModal ||
      showEditModal ||
      deleteModal ||
      showAddIssueModal ||
      showMappingModal;

    if (isAnyModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [
    showModal,
    showEditModal,
    deleteModal,
    showAddIssueModal,
    showMappingModal,
  ]);

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
    if (selectedIds.length === currentIssues.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(currentIssues.map((item) => item.issue_id));
    }
  };

  return (
    <>
      {loading && <Loading />}
      <div id="wrapper" className={`d-flex ${isOpen ? "toggled" : ""}`}>
        <Sidebar isOpen={isOpen} />
        <Navbar onToggleSidebar={toggleSidebar} />
        <div id="page-content-wrapper">
          <div className="container-fluid px-3 px-md-4 pt-0 pt-md-2">
            <div className="d-flex justify-content-between align-items-center  mb-4 mt-3 flex-wrap">
              <h3 className="admin_head">Create Issues</h3>
              <div className="action-header-btns">
                <button
                  className="issue-primary-action-btn"
                  onClick={() => setShowAddIssueModal(true)}
                >
                  + Add Issue
                </button>

                <button
                  className="issue-primary-action-btn"
                  onClick={handleAddIssuesClick}
                >
                  <AiOutlineIssuesClose className="btn-icon" />
                  Upload file
                </button>
              </div>

              <input
                type="file"
                accept=".json,application/json,.csv,text/csv"
                ref={fileInputRef}
                onChange={handleFileChange}
                style={{ display: "none" }}
              />
            </div>

            {selectedIds.length > 0 && (
              <div className="d-flex justify-content-between align-items-center mb-3 p-2 bg-light border rounded">
                <span>{selectedIds.length} selected</span>

                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => setDeleteModal(true)}
                >
                  Delete Selected
                </button>
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
                          currentIssues.length > 0 &&
                          selectedIds.length === currentIssues.length
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
                    currentIssues.map((item, index) => (
                      <tr key={item.issue_id || index}>
                        <td>
                          <input
                            type="checkbox"
                            checked={selectedIds.includes(item.issue_id)}
                            onChange={() => handleSelectRow(item.issue_id)}
                          />
                        </td>
                        <td>{item.category_name}</td>
                        <td>{item.issue_name}</td>
                        <td>{item.suggested_sla || "-"}</td>
                        <td>{item.issue_routing_channel || "NA"}</td>
                        <td>
                          <button
                            className="show_detail_btn"
                            onClick={() => handleShowDetails(item.issue_id)}
                          >
                            Show Details
                          </button>
                        </td>
                        <td>
                          <div className="action_customer_btn">
                            <button
                              className="customer_edit_btn"
                              onClick={() => handleEdit(item.issue_id)}
                            >
                              <MdModeEdit /> Edit
                            </button>

                            <button
                              className="delete"
                              onClick={() => {
                                setDeleteId(item.issue_id);
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

            {totalPages > 1 && (
              <div className="pagination">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(currentPage - 1)}
                >
                  ‹
                </button>

                {getPagination(currentPage, totalPages).map((item, index) =>
                  item === "..." ? (
                    <span key={index} className="dots">
                      ...
                    </span>
                  ) : (
                    <button
                      key={index}
                      className={currentPage === item ? "active" : ""}
                      onClick={() => setCurrentPage(item)}
                    >
                      {item}
                    </button>
                  ),
                )}

                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(currentPage + 1)}
                >
                  ›
                </button>
              </div>
            )}
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
        />

        <ConfirmDeleteModal
          show={deleteModal}
          message="Are you sure you want to delete selected issue(s)?"
          onConfirm={async () => {
            try {
              if (selectedIds.length > 0) {
                await deleteIssue({
                  issue_ids: selectedIds,
                });

                setIssues((prev) =>
                  prev.filter((issue) => !selectedIds.includes(issue.issue_id)),
                );

                setSelectedIds([]);
              } else if (deleteId) {
                await deleteIssue({
                  issue_ids: [deleteId],
                });

                setIssues((prev) =>
                  prev.filter((issue) => issue.issue_id !== deleteId),
                );
              }

              toast.error("Issue deleted successfully!");
            } catch (error) {
              toast.error("Failed to delete issue!");
              console.error(error);
            } finally {
              setDeleteModal(false);
              setDeleteId(null);
            }
          }}
          onCancel={() => {
            setDeleteModal(false);
            setDeleteId(null);
          }}
        />

        <AddIssueModal
          show={showAddIssueModal}
          onClose={() => setShowAddIssueModal(false)}
          organization={organization_id}
          onIssueAdded={handleIssueAdded}
        />

        <CsvMappingModal
          show={showMappingModal}
          onClose={() => setShowMappingModal(false)}
          fileData={uploadedFileData}
        />
      </div>
    </>
  );
}

export default Resolutions;
