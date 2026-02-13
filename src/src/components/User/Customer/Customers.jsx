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
  const rowsPerPage = 5;
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentCategories = categories.slice(indexOfFirstRow, indexOfLastRow);
  const totalPages = Math.ceil(categories.length / rowsPerPage);

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
  const GetCustomers = async () => {
    try {
      setIsLoading(true);
      const res = await GetCustomersList();
      console.log(res.data, "GetAllCustomersList");
      if (res.status === 200) {
        const sortedCategories = [...(res.data || [])].reverse();

        setCategories(sortedCategories);
        const formatted = sortedCategories.map((cat) => ({
          value: cat.id,
          label: cat.name,
          issues: cat.issues,
        }));
        setCategoryOptionsState(formatted);
      }
    } catch (err) {
      if (err?.response?.status === 401) handleLogout();
      console.error("Error fetching categories:", err);
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    GetCustomers();
  }, []);

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
  const handleDelete = async (id) => {
    console.log("Delete id:", id);
    try {
      const res = await DeleteCustomer(id);

      if (res.status === 200 || res.status === 201) {
        toast.error("Customer deleted successfully!");
        GetCustomers();
      }
    } catch (error) {
      console.error("Delete error:", error);

      if (error?.response?.status === 401) {
        handleLogout();
      } else {
        toast.error("Failed to delete customer!");
      }
    }
  };

  const handleSelectRow = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === currentCategories.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(currentCategories.map((item) => item.id));
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
                        currentCategories.length > 0 &&
                        selectedIds.length === currentCategories.length
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
                {currentCategories.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center text-muted">
                      No customers found
                    </td>
                  </tr>
                ) : (
                  currentCategories.map((row) => (
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
                            onClick={() => {
                              setSelectedCustomerId(row.id);
                              setEditModal(true);
                            }}
                          >
                            <MdModeEdit /> Edit
                          </button>

                          <button
                            className="delete"
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

          <EditCustomerModal
            show={editModal}
            customerId={selectedCustomerId}
            onClose={() => {
              setEditModal(false);
              setSelectedCustomerId(null);
              GetCustomers();
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
            onConfirm={async () => {
              try {
                if (selectedIds.length > 0) {
                  await DeleteCustomer({
                    customer_ids: selectedIds,
                  });

                  setCategories((prev) =>
                    prev.filter((cust) => !selectedIds.includes(cust.id)),
                  );

                  setSelectedIds([]);
                } else if (deleteId) {
                  await DeleteCustomer({
                    customer_ids: [deleteId],
                  });

                  setCategories((prev) =>
                    prev.filter((cust) => cust.id !== deleteId),
                  );
                }

                toast.error("Customer deleted successfully!");
              } catch (error) {
                toast.error("Failed to delete customer!");
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
