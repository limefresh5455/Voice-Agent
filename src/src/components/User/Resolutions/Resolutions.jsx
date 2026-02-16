import React, { useEffect, useRef, useState } from "react";
import Sidebar from "../../CommonComponent/SideBar/SideBar";
import Navbar from "../../CommonComponent/Navbar/Navbar";
import Loading from "../../CommonComponent/Loading/Loading";

import {
  deleteIssue,
  GetIssues,
  ShowIssuesDetail,
  UpdateIssues,
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
  const [bulkEditIndex, setBulkEditIndex] = useState(0);
  const bulkUpdateRef = useRef([]);
  const [isBulkEditing, setIsBulkEditing] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [currentMappingIndex, setCurrentMappingIndex] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [allMappings, setAllMappings] = useState([]);
  const rowsPerPage = 20;

  const handleFinalSubmit = async (mappings) => {
    try {
      setLoading(true);

      const formData = new FormData();

      mappings.forEach((item, index) => {
        formData.append("files", item.file);
        formData.append(`mappings[${index}]`, JSON.stringify(item.mapping));
        formData.append(`header_rows[${index}]`, item.headerRow);
      });

      await ImportIssuesWithMapping(formData);

      toast.success("All files imported successfully!");
    } catch (error) {
      toast.error("Import failed!");
    } finally {
      setLoading(false);
    }
  };

  const handleNext = (data) => {
    const updatedMappings = [...allMappings, data];
    setAllMappings(updatedMappings);

    if (currentIndex < files.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      handleFinalSubmit(updatedMappings);
    }
  };
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
  const fetchIssues = async (page = 1) => {
    try {
      setLoading(true);

      const res = await GetIssues(organization_id, page, rowsPerPage);

      if (res.status === 200) {
        const responseData = res.data;

        setIssues(responseData.data || []);
        setTotalCount(responseData.total || 0);
        setTotalPages(responseData.total_pages || 1);
        setCurrentPage(responseData.page || 1);
      }
    } catch (error) {
      console.error("API ERROR", error?.response || error);
      toast.error("Failed to fetch issues");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!organization_id) return;
    fetchIssues(currentPage);
  }, [organization_id, currentPage]);

  const fileInputRef = useRef(null);
  const handleAddIssuesClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    const allowedTypes = ["application/json", "text/csv"];
    const allowedExtensions = [".json", ".csv"];

    const validFiles = files.filter((file) => {
      const fileExtension = file.name
        .slice(file.name.lastIndexOf("."))
        .toLowerCase();

      return (
        allowedTypes.includes(file.type) ||
        allowedExtensions.includes(fileExtension)
      );
    });

    if (validFiles.length !== files.length) {
      toast.error("Only JSON or CSV files are allowed");
      return;
    }

    try {
      const formData = new FormData();

      files.forEach((file) => {
        formData.append("files", file); // IMPORTANT
      });

      const res = await UploadIssuesFile(formData);

      toast.success("Files uploaded successfully");

      // Save all results
      setUploadedFiles(
        res.data.results.map((result, index) => ({
          ...result,
          file: files[index],
        })),
      );

      setCurrentMappingIndex(0);
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
        toast.success("Issue updated successfully!");
        setShowEditModal(false);
        fetchIssues();
      }
    } catch (error) {
      console.error(error);
      toast.error("Update failed!");
    }
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
    if (selectedIds.length === issues.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(issues.map((item) => item.issue_id));
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
                multiple
              />
            </div>

            {selectedIds.length > 0 && (
              <div className="d-flex justify-content-between align-items-center mb-3 p-2 bg-light border rounded">
                <span>{selectedIds.length} selected</span>
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
                    Edit
                  </button>

                  <button
                    className="delete"
                    onClick={() => setDeleteModal(true)}
                  >
                    <MdDelete />
                    Delete
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
                              disabled={selectedIds.length > 0}
                              style={{
                                cursor:
                                  selectedIds.length > 0
                                    ? "not-allowed"
                                    : "pointer",
                              }}
                              onClick={() => handleEdit(item.issue_id)}
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

              toast.success("Issue deleted successfully!");
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
          organization={organization_id}
          onIssueAdded={handleIssueAdded}
        />

        <CsvMappingModal
          show={showMappingModal}
          onClose={() => setShowMappingModal(false)}
          fileData={uploadedFiles[currentMappingIndex]}
          currentIndex={currentMappingIndex}
          totalFiles={uploadedFiles.length}
          onNext={() => {
            if (currentMappingIndex < uploadedFiles.length - 1) {
              setCurrentMappingIndex((prev) => prev + 1);
            } else {
              setShowMappingModal(false);
              fetchIssues();
            }
          }}
        />
      </div>
    </>
  );
}

export default Resolutions;
