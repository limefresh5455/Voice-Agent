import React, { useEffect, useState } from "react";
import Navbar from "../../CommonComponent/Navbar/Navbar";
import Loading from "../../CommonComponent/Loading/Loading";
import Sidebar from "../../CommonComponent/SideBar/SideBar";
import { useAppContext } from "../../Context/AppContext";
import { toast } from "react-toastify";
import { FaLink } from "react-icons/fa6";
import {
  DeleteCustomer,
  GetCustomersList,
  UploadFile,
} from "../UserServices/UserServices";
import ConfirmDeleteModal from "../../CommonComponent/ConfirmDeleteModal/ConfirmDeleteModal";
import { useNavigate } from "react-router-dom";
import AddCustomerModal from "../../Admin/AddCustomerModal";
import EditCustomerModal from "./EditCustomerModal";
import { FaUser, FaUsers } from "react-icons/fa";
import { MdModeEdit, MdDelete } from "react-icons/md";
import { useRef } from "react";

function Customers() {
  const navigate = useNavigate();
  const { handleLogout } = useAppContext();
  const [isOpen, setIsOpen] = useState(true);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [categoryOptionsState, setCategoryOptionsState] = useState([]);
  const [isLoadingFile, setIsLoadingFile] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [linkModal, setLinkModal] = useState(false);
  const [generatedLink, setGeneratedLink] = useState("");
  const BASE_URL = import.meta.env.VITE_BASE_URL;
  const id = sessionStorage.getItem("org_id");
  const org_Name = sessionStorage.getItem("organization_name");
  const orgId = id;
  const org_name = org_Name.replace(/\s+/g, "");
  const [editModal, setEditModal] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  const bulkUpdateRef = useRef([]);
  const [bulkEditIds, setBulkEditIds] = useState([]);
  const [bulkEditIndex, setBulkEditIndex] = useState(0);
  const [selectedIds, setSelectedIds] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

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

  const handleGenerateLink = () => {
    console.log(orgId, org_name, "orgId");

    setGeneratedLink(
      `${window.location.origin}/chat/${orgId}/${encodeURIComponent(
        org_name,
      )}/customer-ai-chatbot`,
    );

    setLinkModal(true);
  };

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };
  const GetCustomers = async (page = 1) => {
    try {
      setIsLoading(true);

      const res = await GetCustomersList(page, pageSize);

      if (res.status === 200) {
        const responseData = res.data;

        setCategories(responseData.data || []);
        setTotalPages(responseData.total_pages);
        setTotalCount(responseData.total);
      }
    } catch (err) {
      if (err?.response?.status === 401) handleLogout();
      console.error("Error fetching customers:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    GetCustomers(currentPage);
  }, [currentPage]);

  useEffect(() => {
    const pageWrapper = document.getElementById("page-content-wrapper");

    if (editModal) {
      pageWrapper?.classList.add("no-scroll");
    } else {
      pageWrapper?.classList.remove("no-scroll");
    }

    return () => {
      pageWrapper?.classList.remove("no-scroll");
    };
  }, [editModal]);

  const handleJsonUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== "application/json") {
      toast.error("Please upload a valid JSON file!");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    setIsLoadingFile(true);

    try {
      const res = await UploadFile(formData);
      if (res.status === 200 || res.status === 201) {
        toast.success("Customer JSON uploaded successfully!");
        GetCustomers();
      }
    } catch (err) {
      console.error(err);
      toast.error("Error uploading file!");
    } finally {
      setIsLoadingFile(false);
    }
    e.target.value = "";
  };

  const handleSelectRow = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === categories.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(categories.map((item) => item.id));
    }
  };

  const handleBulkEdit = () => {
    if (selectedIds.length === 0) {
      toast.error("Please select at least one customer");
      return;
    }

    bulkUpdateRef.current = [];
    setBulkEditIds(selectedIds);
    setBulkEditIndex(0);
    setSelectedCustomerId(selectedIds[0]);
    setEditModal(true);
  };

  return (
    <div id="wrapper" className={`d-flex ${isOpen ? "toggled" : ""}`}>
      {isLoading && <Loading />}
      <Sidebar isOpen={isOpen} />
      <Navbar onToggleSidebar={toggleSidebar} />
      <div id="page-content-wrapper">
        <div className="container-fluid px-3 px-md-4 pt-0 pt-md-2">
          <div className="d-flex justify-content-between align-items-center mb-4 mt-3 flex-wrap">
            <h3 className="admin_head">Connect To Customers</h3>
            <div className="customer-btn-wrapper">
              <button
                className="add_btn01"
                data-bs-toggle="modal"
                data-bs-target="#addCustomerModal"
              >
                <FaUser className="admin_icon" /> Add Customer
              </button>
              <AddCustomerModal />
              <button
                className="add_btn01"
                onClick={() =>
                  document.getElementById("jsonUploadInput").click()
                }
              >
                <FaUsers className="admin_icon" /> Multiple Add Customer
              </button>
            </div>

            <input
              type="file"
              id="jsonUploadInput"
              accept=".json"
              style={{ display: "none" }}
              onChange={handleJsonUpload}
            />
          </div>
          {selectedIds.length > 0 && (
            <div className="d-flex justify-content-between align-items-center mb-3 p-2 bg-light border rounded">
              <span>{selectedIds.length} selected</span>

              <div className="d-flex gap-2">
                <button className="customer_edit_btn" onClick={handleBulkEdit}>
                  <MdModeEdit />
                  Edit
                </button>

                <button className="delete" onClick={() => setDeleteModal(true)}>
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
                        categories.length > 0 &&
                        selectedIds.length === categories.length
                      }
                      onChange={handleSelectAll}
                    />
                  </th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Location</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {categories.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center text-muted">
                      No customers found
                    </td>
                  </tr>
                ) : (
                  categories.map((row) => (
                    <tr key={row.id}>
                      <td>
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(row.id)}
                          onChange={() => handleSelectRow(row.id)}
                        />
                      </td>
                      <td>{row.name}</td>
                      <td>{row.email}</td>
                      <td>{row.location}</td>

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
                            onClick={() => {
                              setSelectedCustomerId(row.id);
                              setEditModal(true);
                            }}
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
                              setDeleteId(row.id);
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

          <div className="pagination">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => prev - 1)}
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
              onClick={() => setCurrentPage((prev) => prev + 1)}
            >
              ›
            </button>
          </div>

          <EditCustomerModal
            show={editModal}
            customerId={selectedCustomerId}
            onClose={(isUpdated) => {
              setEditModal(false);
              setSelectedCustomerId(null);

              if (isUpdated) {
                setSelectedIds([]);
                setBulkEditIds([]);
                setBulkEditIndex(0);
              }

              GetCustomers(currentPage);
            }}
            bulkEditIds={bulkEditIds}
            bulkEditIndex={bulkEditIndex}
            setBulkEditIndex={setBulkEditIndex}
            bulkUpdateRef={bulkUpdateRef}
            setBulkEditIds={setBulkEditIds}
          />

          <ConfirmDeleteModal
            show={deleteModal}
            message="Are you sure you want to delete selected customer(s)?"
            isDeleting={isDeleting}
            onConfirm={async () => {
              try {
                setIsDeleting(true);

                if (selectedIds.length > 0) {
                  await DeleteCustomer({ customer_ids: selectedIds });
                } else if (deleteId) {
                  await DeleteCustomer({ customer_ids: [deleteId] });
                }

                toast.success("Customer deleted successfully!");

                setSelectedIds([]);
                setDeleteId(null);

                await GetCustomers(currentPage);
              } catch (error) {
                toast.error("Failed to delete customer!");
                console.error(error);
              } finally {
                setIsDeleting(false);
                setDeleteModal(false);
              }
            }}
            onCancel={() => {
              if (!isDeleting) {
                setDeleteModal(false);
                setDeleteId(null);
              }
            }}
          />

          {linkModal && (
            <div className="modalOverlay">
              <div className="modalContainer">
                <h4 className="edit_customer_head">Customer Chat Link</h4>

                <p>
                  <span
                    className="custome_link"
                    onClick={() => {
                      if (generatedLink) {
                        window.open(generatedLink, "_blank");
                      } else {
                        console.error("Invalid generated link");
                      }
                    }}
                  >
                    {generatedLink}
                  </span>
                </p>

                <div className="d-flex justify-content-end mt-3">
                  <button
                    className="btn btn-secondary me-2"
                    onClick={() => setLinkModal(false)}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}

          <button className="generateLinkBtn" onClick={handleGenerateLink}>
            Generate Link
            <FaLink className="ms-2" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default Customers;
