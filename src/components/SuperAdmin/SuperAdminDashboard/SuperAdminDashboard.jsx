import React, { useEffect, useState } from "react";
import Navbar from "../../CommonComponent/Navbar/Navbar";
import {
  CreateOrganization,
  GetOrganizationsList,
  ShowOrganizationDetail,
  ShowStatus,
  UpdateOrganizationDetails,
  deleteOrganization,
} from "../SuperAdminServices/SuperAdminServices";
import { toast } from "react-toastify";
import Loading from "../../CommonComponent/Loading/Loading";
import { useAppContext } from "../../Context/AppContext";
import Sidebar from "../../CommonComponent/SideBar/SideBar";
import CreateFormModal from "../../CommonComponent/CreateFormModal/CreateFormModal";
import ConfirmDeleteModal from "../../CommonComponent/ConfirmDeleteModal/ConfirmDeleteModal";
import { MdModeEdit, MdDelete } from "react-icons/md";
function SuperAdminDashboard() {
  const { handleLogout } = useAppContext();
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [organization_name, setOrganizationName] = useState("");
  const [email, setEmail] = useState("");
  const [organizations, setOrganizations] = useState([]);
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
  const [selectedIds, setSelectedIds] = useState([]);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };
  const GetOrganizationsDetail = async () => {
    try {
      setIsLoading(true);
      const res = await GetOrganizationsList();
      if (res.status === 200 || res.status === 201) {
        const companies = res?.data?.data || [];

        const sortedData = Array.isArray(companies)
          ? [...companies].sort((a, b) => a.id - b.id)
          : [];

        setOrganizations(
          sortedData.map((item) => ({
            ...item,
            isActive: item.isActive ?? true,
          })),
        );
      }
    } catch (error) {
      if (error.response.status === 401) {
        handleLogout();
      }
      console.error("Error fetching users:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    GetOrganizationsDetail();
  }, []);

  const handleSave = async () => {
    if (!organization_name || !email || !phone_no || !location) {
      toast.error("All fields are required!");
      return;
    }
    const payload = {
      oname: organization_name,
      email,
      phone_no: Number(phone_no),
      location,
      website: website || "",
      description: description || "",
    };

    try {
      const res = await CreateOrganization(payload);
      if (res.status === 200 || res.status === 201) {
        toast.success("Organization created successfully!");
      }
      await GetOrganizationsDetail();
      resetForm();
    } catch (error) {
      console.error("Error saving:", error);
      if (error.response?.status === 401) {
        handleLogout();
      }
    }
  };

  const resetForm = () => {
    setOrganizationName("");
    setEmail("");
    setShowModal(false);
    setIsEditMode(false);
    setPhoneNo("");
    setLocation("");
    setWebsite("");
    setDescription("");
    setEditData(null);
  };
  const handleToggle = async (id) => {
    try {
      const current = organizations.find((a) => a.id === id);
      const newStatus = !current.isActive;
      const res = await ShowStatus(id, newStatus);
      if (res.status === 200 || res.status === 201) {
        setOrganizations((prev) =>
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

  const handleShowDetail = async (id) => {
    try {
      setIsLoading(true);
      const res = await ShowOrganizationDetail(id);
      if (res.status === 200) {
        setOrgDetail(res.data);
        setIsModalOpen(true);
      }
    } catch (error) {
      toast.error("Failed to load details");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = async (id) => {
    try {
      setIsLoading(true);
      setIsEditMode(true);

      const res = await ShowOrganizationDetail(id);

      if (res.status === 200) {
        const data = res.data;

        setEditData(data);

        setOrganizationName(data.name || "");
        setEmail(data.email || "");
        setPhoneNo(data.phone_no || "");
        setLocation(data.location || "");
        setWebsite(data.website || "");
        setDescription(data.description || "");

        setShowModal(true);
      }
    } catch (error) {
      toast.error("Failed to load organization details");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!organization_name || !email || !phone_no || !location) {
      toast.error("All required fields must be filled!");
      return;
    }

    const payload = {
      oname: organization_name,
      email: email,
      phone_no: Number(phone_no),
      location: location,
      website: website || "",
      description: description || "",
    };

    try {
      const res = await UpdateOrganizationDetails(editData.id, payload);
      console.log("Update response:", res);
      toast.success("Organization updated successfully!");
      await GetOrganizationsDetail();
      resetForm();
    } catch (error) {
      console.error("Error updating:", error.response?.data);
      toast.error(error.response?.data?.detail || "Update failed!");
    }
  };

  const handleSelectRow = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === organizations.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(organizations.map((item) => item.id));
    }
  };

  return (
    <div id="wrapper" className={`d-flex ${isOpen ? "toggled" : ""}`}>
      {isLoading && <Loading />}
      <Sidebar isOpen={isOpen} />
      <Navbar onToggleSidebar={toggleSidebar} />
      <div id="page-content-wrapper">
        <div className="container-fluid px-3 px-md-4 pt-0 pt-md-2">
          <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap">
            <h3 className="admin_head">Connect to Organizations</h3>
            <button
              className="add_btn01"
              onClick={() => {
                resetForm();
                setShowModal(true);
              }}
            >
              Add to Organization
            </button>
          </div>
          {selectedIds.length > 0 && (
            <div className="d-flex justify-content-between align-items-center mb-3 p-2 bg-light border rounded">
              <span>{selectedIds.length} selected</span>

              <div className="d-flex gap-2">
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => setDeleteModal(true)}
                >
                  Delete Selected
                </button>
              </div>
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
                        organizations.length > 0 &&
                        selectedIds.length === organizations.length
                      }
                      onChange={handleSelectAll}
                    />
                  </th>
                  <th>Organization Name</th>
                  <th>Organization Email</th>
                  <th>Detail</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {organizations.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center text-muted">
                      Admin details not found
                    </td>
                  </tr>
                ) : (
                  organizations.map((item) => (
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
                      <td>
                        <button
                          className="show_detail_btn"
                          style={{ margin: "auto" }}
                          onClick={() => handleShowDetail(item.id)}
                        >
                          Show Detail
                        </button>
                      </td>
                      <td>
                        <div className="form-check form-switch d-flex align-items-center gap-2">
                          <input
                            className="form-check-input status-toggle"
                            type="checkbox"
                            checked={item.isActive}
                            onChange={() => handleToggle(item.id)}
                          />
                          <label
                            className="form-check-label"
                            style={{ fontWeight: "600" }}
                          >
                            {item.isActive ? "Active" : "Deactive"}
                          </label>
                        </div>
                      </td>
                      <td>
                        <div className="action_customer_btn">
                          <button
                            className="customer_edit_btn"
                            onClick={() => handleEdit(item.id)}
                          >
                            <MdModeEdit /> Edit
                          </button>

                          <button
                            className="delete"
                            onClick={() => {
                              setDeleteId(item.id);
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
            {isModalOpen && (
              <div
                className="modal fade show"
                style={{ display: "block", background: "rgba(0,0,0,0.5)" }}
              >
                <div className="modal-dialog modal-dialog-centered orgnize_modal">
                  <div className="modal-content">
                    <div className="modal-header">
                      <h5 className="modal-title">Organization Details</h5>
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
          </div>

          <CreateFormModal
            role="superadmin"
            title={isEditMode ? "Edit Organization" : "Add New Organization"}
            show={showModal}
            onClose={() => setShowModal(false)}
            handleSave={isEditMode ? handleUpdate : handleSave}
            Save={isEditMode ? "Update Organization" : "Save Organization"}
            organization_name={organization_name}
            setOrganizationName={setOrganizationName}
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
            message="Are you sure you want to delete selected organization(s)?"
            onConfirm={async () => {
              if (selectedIds.length > 0) {
                await deleteOrganization({
                  org_ids: selectedIds,
                });

                setOrganizations((prev) =>
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

export default SuperAdminDashboard;
