import React, { useEffect, useState } from "react";
import Navbar from "../../CommonComponent/Navbar/Navbar";
import { toast } from "react-toastify";
import Loading from "../../CommonComponent/Loading/Loading";
import { useAppContext } from "../../Context/AppContext";
import Sidebar from "../../CommonComponent/SideBar/SideBar";
import CreateFormModal from "../../CommonComponent/CreateFormModal/CreateFormModal";
import ConfirmDeleteModal from "../../CommonComponent/ConfirmDeleteModal/ConfirmDeleteModal";

import {
  CreateAdmin,
  deleteAdmin,
  GetAdminsList,
  ShowAdminDetails,
} from "../UserServices/UserServices";
import { RiAdminFill } from "react-icons/ri";
import { MdDelete } from "react-icons/md";
function UserDashboard() {
  const { handleLogout } = useAppContext();
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [admins, setAdmins] = useState([]);
  const [editData, setEditData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [phone_no, setPhoneNo] = useState("");
  const [location, setLocation] = useState("");
  const [website, setWebsite] = useState("");
  const [description, setDescription] = useState("");
  const [orgDetail, setOrgDetail] = useState(null);
  const [showAdminDetailModal, setShowAdminDetailModal] = useState(false);
  const [adminDetail, setAdminDetail] = useState(null);
  const [adminDetailLoading, setAdminDetailLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState([]);
  const rowsPerPage = 5;
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentAdmins = admins.slice(indexOfFirstRow, indexOfLastRow);
  const totalPages = Math.ceil(admins.length / rowsPerPage);
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

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };
  const GetAdminsDetail = async () => {
    try {
      setIsLoading(true);

      const res = await GetAdminsList();

      if (res.status === 200 || res.status === 201) {
        const companies = Array.isArray(res.data) ? res.data : [];
        const sortedData = [...companies].sort((a, b) => b.id - a.id);

        setAdmins(
          sortedData.map((item) => ({
            ...item,
            isActive: item.isActive ?? true,
          })),
        );
      }
    } catch (error) {
      if (error?.response?.status === 401) {
        handleLogout();
      }
      console.error("Error fetching admins:", error);
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    GetAdminsDetail();
  }, []);
  const handleSave = async () => {
    if (!name || !email || !phone_no || !description) {
      toast.error("All fields are required!");
      return;
    }

    const payload = {
      name,
      email,
      phone_no,
      description,
    };

    try {
      const res = await CreateAdmin(payload);

      if (res.status === 200 || res.status === 201) {
        toast.success("Admin created successfully!");
      }

      await GetAdminsDetail();
      resetForm();
    } catch (error) {
      console.error("Error saving:", error);
      if (error.response?.status === 401) {
        handleLogout();
      }
    }
  };
  const resetForm = () => {
    setName("");
    setEmail("");
    setPhoneNo("");
    setDescription("");
    setShowModal(false);
    setIsEditMode(false);
    setEditData(null);
  };
  const handleDelete = async (id) => {
    try {
      const res = await deleteAdmin({ admin_id: id });
      if (res.status === 200 || res.status === 201) {
        setAdmins((prev) => prev.filter((x) => x.id !== id));
        toast.error("Admin deleted successfully!");
      }
    } catch (error) {
      console.error("Error deleting admin:", error);
      if (error.response.status === 401) {
        handleLogout();
      }
    }
  };
  const handleToggle = async (id) => {
    try {
      const current = admins.find((a) => a.id === id);
      const newStatus = !current.isActive;
      const res = await ShowStatus(id, newStatus);
      if (res.status === 200 || res.status === 201) {
        setAdmins((prev) =>
          prev.map((admin) =>
            admin.id === id ? { ...admin, isActive: newStatus } : admin,
          ),
        );
        toast.success(
          newStatus ? "Organization Activated!" : "Organization Deactivated!",
        );
      }
    } catch (error) {
      toast.error("Toggle failed!");
    }
  };
  const handleShowAdminDetail = async (admin_id) => {
    try {
      setAdminDetailLoading(true);
      setShowAdminDetailModal(true);
      setAdminDetail(null);
      const res = await ShowAdminDetails(admin_id);
      setAdminDetail(res);
    } catch (error) {
      toast.error("Failed to load admin details");
      setShowAdminDetailModal(false);
    } finally {
      setAdminDetailLoading(false);
    }
  };

  useEffect(() => {
    const isAnyModalOpen =
      showModal || deleteModal || isModalOpen || showAdminDetailModal;

    if (isAnyModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [showModal, deleteModal, isModalOpen, showAdminDetailModal]);

  const handleSelectRow = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === admins.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(admins.map((item) => item.id));
    }
  };
  return (
    <div id="wrapper" className={`d-flex ${isOpen ? "toggled" : ""}`}>
      {isLoading && <Loading />}
      <Sidebar isOpen={isOpen} />
      <Navbar onToggleSidebar={toggleSidebar} />
      <div id="page-content-wrapper">
        <div className="container-fluid px-3 px-md-4 pt-0 pt-md-2">
          <div className="d-flex justify-content-between align-items-center  mb-4 mt-3 flex-wrap">
            <h3 className="admin_head">Connect to Admins</h3>
            <button
              className="add_btn01"
              onClick={() => {
                resetForm();
                setShowModal(true);
              }}
            >
              <RiAdminFill className="admin_icon" /> Add to Admin
            </button>
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
            <table className="table table-striped">
              <thead className="table-dark">
                <tr>
                  <th>
                    <input
                      type="checkbox"
                      checked={
                        admins.length > 0 &&
                        selectedIds.length === admins.length
                      }
                      onChange={handleSelectAll}
                    />
                  </th>

                  <th>Admin Name</th>
                  <th>Admin Email</th>
                  <th>Description</th>
                  <th>Queries Solved</th>
                  <th>Details</th>
                  <th>Delete</th>
                </tr>
              </thead>
              <tbody>
                {admins.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center text-muted">
                      Admin details not found
                    </td>
                  </tr>
                ) : (
                  admins.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(item.id)}
                          onChange={() => handleSelectRow(item.id)}
                        />
                      </td>
                      <td>{item.name}</td>
                      <td>{item.email}</td>
                      <td>{item.description}</td>
                      <td>{item.queries_solved_count}</td>
                      <td>
                        <button
                          className="show_detail_btn"
                          onClick={() => handleShowAdminDetail(item.id)}
                        >
                          Show Details
                        </button>
                      </td>
                      <td>
                        <button
                          className="delete"
                          onClick={() => {
                            setDeleteId(item.id);
                            setDeleteModal(true);
                          }}
                        >
                          <MdDelete /> Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            {isModalOpen && (
              <div
                className="modal fade show"
                style={{ display: "block", background: "rgba(0,0,0,0.5)" }}
              >
                <div className="modal-dialog modal-dialog-centered">
                  <div className="modal-content">
                    <div className="modal-header">
                      <h5 className="modal-title">Customer Details</h5>
                      <button
                        type="button"
                        className="btn-close"
                        onClick={() => setIsModalOpen(false)}
                      ></button>
                    </div>

                    <div className="modal-body">
                      {orgDetail ? (
                        <>
                          <p>
                            <strong>ID:</strong> {orgDetail.id}
                          </p>

                          <p>
                            <strong>Name:</strong> {orgDetail.name}
                          </p>

                          <p>
                            <strong>Email:</strong> {orgDetail.email}
                          </p>

                          <p>
                            <strong>Phone:</strong> {orgDetail.phone_no}
                          </p>

                          <p>
                            <strong>Location:</strong> {orgDetail.location}
                          </p>

                          <p>
                            <strong>Website:</strong>{" "}
                            {orgDetail.website ? orgDetail.website : "N/A"}
                          </p>

                          <p>
                            <strong>Description:</strong>{" "}
                            {orgDetail.description
                              ? orgDetail.description
                              : "N/A"}
                          </p>

                          <p>
                            <strong>Chatbot Link:</strong>{" "}
                            {orgDetail.chatbot_link
                              ? orgDetail.chatbot_link
                              : "N/A"}
                          </p>

                          <p>
                            <strong>Status:</strong>{" "}
                            {orgDetail.is_active ? "Active" : "Inactive"}
                          </p>

                          <p>
                            <strong>Created At:</strong>{" "}
                            {new Date(orgDetail.created_at).toLocaleString()}
                          </p>
                        </>
                      ) : (
                        <p>Loading...</p>
                      )}
                    </div>

                    <div className="modal-footer">
                      <button
                        className="btn btn-secondary"
                        onClick={() => {
                          setIsModalOpen(false);
                          setOrgDetail(null);
                        }}
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {showAdminDetailModal && (
              <div
                className="modal fade show"
                style={{ display: "block", background: "rgba(0,0,0,0.5)" }}
              >
                <div className="modal-dialog modal-dialog-centered admin-detail-modal">
                  <div className="modal-content">
                    <div className="modal-header">
                      <h5 className="modal-title">Admin Details</h5>
                      <button
                        type="button"
                        className="btn-close"
                        onClick={() => {
                          setShowAdminDetailModal(false);
                          setAdminDetail(null);
                        }}
                      />
                    </div>

                    <div className="modal-body">
                      <div className="modal-body">
                        {adminDetailLoading ? (
                          <p>Loading details...</p>
                        ) : adminDetail ? (
                          <>
                            <p>
                              <strong>ID:</strong> {adminDetail.id}
                            </p>

                            <p>
                              <strong>Name:</strong> {adminDetail.name}
                            </p>

                            <p>
                              <strong>Email:</strong> {adminDetail.email}
                            </p>

                            <p>
                              <strong>Phone:</strong> {adminDetail.phone}
                            </p>

                            <p>
                              <strong>Description:</strong>{" "}
                              {adminDetail.description}
                            </p>

                            <p>
                              <strong>Queries Solved:</strong>{" "}
                              {adminDetail.queries_solved_count}
                            </p>

                            <p>
                              <strong>Status:</strong>{" "}
                              {adminDetail.is_active ? "Active" : "Inactive"}
                            </p>

                            <p>
                              <strong>Created At:</strong>{" "}
                              {new Date(
                                adminDetail.created_at,
                              ).toLocaleString()}
                            </p>
                          </>
                        ) : (
                          <p>No details found</p>
                        )}
                      </div>
                    </div>

                    <div className="modal-footer">
                      <button
                        className="btn btn-secondary"
                        onClick={() => {
                          setShowAdminDetailModal(false);
                          setAdminDetail(null);
                        }}
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
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
          <CreateFormModal
            role="user"
            title={isEditMode ? "Edit Admin" : "Add New Admin"}
            Save="Save Admin"
            show={showModal}
            onClose={() => setShowModal(false)}
            handleSave={handleSave}
            name={name}
            setName={setName}
            email={email}
            setEmail={setEmail}
            phone_no={phone_no}
            setPhoneNo={setPhoneNo}
            location={location}
            setLocation={setLocation}
            website={website}
            setWebsite={setWebsite}
            description={description}
            setDescription={setDescription}
            isEditMode={isEditMode}
          />
          <ConfirmDeleteModal
            show={deleteModal}
            message="Are you sure you want to delete the selected admin(s)?"
            onConfirm={async () => {
              if (selectedIds.length > 0) {
                await deleteAdmin({
                  admin_ids: selectedIds,
                });

                setAdmins((prev) =>
                  prev.filter((org) => !selectedIds.includes(org.id)),
                );

                setSelectedIds([]);
              } else if (deleteId) {
                await deleteOrganization({
                  org_ids: [deleteId],
                });

                setOrganizations((prev) =>
                  prev.filter((org) => org.id !== deleteId),
                );
              }

              setDeleteModal(false);
              setDeleteId(null);
            }}
            onCancel={() => setDeleteModal(false)}
          />
        </div>
      </div>
    </div>
  );
}

export default UserDashboard;
