import React, { useEffect } from "react";
import { useState } from "react";
import AdminSidebar from "../AdminSidebar";
import Loading from "../../CommonComponent/Loading/Loading";
import { FaBars, FaRobot } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import AdminHeader from "../AdminHeader/AdminHeader";
import { RiAdminFill } from "react-icons/ri";
import {
  CreateCustomer,
  DeleteAdminCustomer,
  editAdminCustomer,
  GetAdminCustomerDetails,
  GetAllCustomers,
} from "../AdminServices/AdminServices";
import { MdDelete, MdModeEdit } from "react-icons/md";
import { toast } from "react-toastify";
import ConfirmDeleteModal from "../../CommonComponent/ConfirmDeleteModal/ConfirmDeleteModal";
const AdminCustomer = () => {
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(true);
  const [isloading, setIsLoading] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [customerDetails, setCustomerDetails] = useState(null);
  const [bulkEditIndex, setBulkEditIndex] = useState(0);
  const bulkUpdateRef = React.useRef([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  const pageSize = 20;

  const [customerForm, setCustomerForm] = useState({
    FirstName: "",
    LastName: "",
    Email: "",
    Phone: "",
    Location: "",
  });
  const [showEditModal, setShowEditModal] = useState(false);
  const [editCustomerId, setEditCustomerId] = useState(null);
  const [editCustomerForm, setEditCustomerForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    city: "",
  });
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleteCustomerId, setDeleteCustomerId] = useState(null);
  const [selectedCustomers, setSelectedCustomers] = useState([]);
  const { t } = useTranslation();
  const toggleLeftSidebar = () => {
    setLeftSidebarOpen((prev) => !prev);
  };

  const handleCustomerChange = (e) => {
    const { name, value } = e.target;
    setCustomerForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCreateCustomer = async () => {
    const { FirstName, LastName, Email, Phone, Location } = customerForm;

    if (!FirstName || !LastName || !Email || !Phone || !Location) {
      toast.warning(t("allFieldsRequired"));
      return;
    }

    try {
      setIsLoading(true);
      await CreateCustomer(customerForm);
      toast.success(t("customerCreatedSuccess"));
      setShowCustomerForm(false);
      setCustomerForm({
        FirstName: "",
        LastName: "",
        Email: "",
        Phone: "",
        Location: "",
      });
      await fetchCustomers();
    } catch (error) {
      toast.error(t("customerCreateFailed"));
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCustomers = async (page = 1) => {
    try {
      setLoadingCustomers(true);

      const res = await GetAllCustomers(page, pageSize);

      if (res.status === 200) {
        const responseData = res.data;

        setCustomers(responseData.data || []);
        setTotalCount(responseData.total || 0);
        setTotalPages(responseData.total_pages || 1);
        setCurrentPage(responseData.page || 1);
      }
    } catch (error) {
      console.error("Failed to fetch customers", error);
      setCustomers([]);
    } finally {
      setLoadingCustomers(false);
    }
  };

  useEffect(() => {
    fetchCustomers(currentPage);
  }, [currentPage]);

  const handleShowDetails = async (customerId) => {
    try {
      setLoadingDetail(true);
      const res = await GetAdminCustomerDetails(customerId);
      setCustomerDetails(res.data);
      setShowDetailsModal(true);
    } catch (error) {
      console.error("Failed to fetch customer details", error);
    } finally {
      setLoadingDetail(false);
    }
  };

  const loadCustomerForEdit = async (customerId) => {
    try {
      setLoadingDetail(true);
      const res = await GetAdminCustomerDetails(customerId);
      const fullName = res.data.name || "";
      const nameParts = fullName.trim().split(" ");
      setEditCustomerForm({
        first_name: nameParts[0] || "",
        last_name: nameParts.slice(1).join(" ") || "",
        email: res.data.email || "",
        phone: res.data.phone || "",
        city: res.data.city || "",
      });
      setEditCustomerId(customerId);
    } catch (error) {
      console.error("Failed to load customer for edit", error);
    } finally {
      setLoadingDetail(false);
    }
  };
  useEffect(() => {
    if (showEditModal) {
      if (selectedCustomers.length > 0) {
        const currentId = selectedCustomers[bulkEditIndex];
        loadCustomerForEdit(currentId);
      }
    }
  }, [showEditModal, bulkEditIndex]);

  const handleEditCustomer = async (customerId) => {
    setBulkEditIndex(0);
    setSelectedCustomers([]);
    await loadCustomerForEdit(customerId);
    setShowEditModal(true);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditCustomerForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleUpdateCustomer = async () => {
    const { first_name, last_name, email, phone, city } = editCustomerForm;
    if (!first_name || !last_name || !email || !phone || !city) {
      toast.warning(t("allFieldsRequired"));
      return;
    }
    const currentCustomerId =
      selectedCustomers.length > 0
        ? selectedCustomers[bulkEditIndex]
        : editCustomerId;
    const updatedData = {
      customer_id: currentCustomerId,
      first_name,
      last_name,
      email,
      phone,
      city,
    };
    try {
      setIsLoading(true);
      if (selectedCustomers.length > 0) {
        bulkUpdateRef.current.push(updatedData);
        if (bulkEditIndex < selectedCustomers.length - 1) {
          setBulkEditIndex((prev) => prev + 1);
          setIsLoading(false);
          return;
        } else {
          await editAdminCustomer(bulkUpdateRef.current);
          toast.success("All customers updated successfully!");
          bulkUpdateRef.current = [];
          setSelectedCustomers([]);
          setShowEditModal(false);
        }
      } else {
        await editAdminCustomer([updatedData]);

        toast.success(t("customerUpdatedSuccess"));
        setShowEditModal(false);
      }
      await fetchCustomers();
    } catch (error) {
      toast.error(t("customerUpdateFailed"));
      console.error("Update error:", error.response?.data || error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteClick = (customerId) => {
    setDeleteCustomerId(customerId);
    setDeleteModal(true);
  };
  const handleDeleteCustomer = async () => {
    try {
      setIsDeleting(true);
      let payload;

      if (selectedCustomers.length > 0) {
        payload = { customer_ids: selectedCustomers };
      } else if (deleteCustomerId) {
        payload = { customer_ids: [deleteCustomerId] };
      }

      await DeleteAdminCustomer(payload);
      toast.success(t("customerDeletedSuccess"));
      setSelectedCustomers([]);
      setDeleteCustomerId(null);
      setDeleteModal(false);
      await fetchCustomers();
    } catch (error) {
      toast.error(t("customerDeleteFailed"));
    } finally {
      setIsDeleting(false);
    }
  };

  useEffect(() => {
    const isAnyModalOpen =
      showCustomerForm || showDetailsModal || showEditModal || deleteModal;

    if (isAnyModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [showCustomerForm, showDetailsModal, showEditModal, deleteModal]);

  const handleSelectCustomer = (id) => {
    setSelectedCustomers((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const handleSelectAll = () => {
    if (selectedCustomers.length === customers.length) {
      setSelectedCustomers([]);
    } else {
      const allIds = customers.map((customer) => customer.id);
      setSelectedCustomers(allIds);
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
          <div className="d-flex justify-content-between align-items-center heading_sec">
            <div className="d-flex align-items-center">
              {/* <FaRobot
                className="me-2"
                style={{ fontSize: "30px", marginTop: "-6px" }}
              /> */}
              <h3 className="admin_head">{t("connectToCustomers")}</h3>
            </div>
            <button
              className="add_btn01"
              onClick={() => setShowCustomerForm(true)}
            >
              <RiAdminFill className="admin_icon" />
              {t("addCustomers")}
            </button>
          </div>
          {selectedCustomers.length > 0 && (
            <div className="d-flex justify-content-between align-items-center mb-3 p-2 bg-light border rounded">
              <span>
                {selectedCustomers.length} {t("selected")}
              </span>
              <div className="d-flex gap-2">
                <button
                  className="customer_edit_btn"
                  onClick={() => {
                    if (selectedCustomers.length === 0) return;
                    setBulkEditIndex(0);
                    setEditCustomerId(selectedCustomers[0]);
                    setShowEditModal(true);
                  }}
                >
                  <MdModeEdit /> {t("edit")}
                </button>

                <button className="delete" onClick={() => setDeleteModal(true)}>
                  <MdDelete />
                  {t("delete")}
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
                        customers.length > 0 &&
                        selectedCustomers.length === customers.length
                      }
                      onChange={handleSelectAll}
                    />
                  </th>
                  <th>{t("customerName")}</th>
                  <th>{t("email")}</th>
                  <th>{t("location")}</th>
                  <th>{t("createdAt")}</th>
                  <th>{t("status")}</th>
                  <th>{t("details")}</th>
                  <th>{t("actions")}</th>
                </tr>
              </thead>

              <tbody>
                {loadingCustomers ? (
                  <tr>
                    <td colSpan="8" className="text-center">
                      {t("loadingCustomers")}
                    </td>
                  </tr>
                ) : customers.length > 0 ? (
                  customers.map((customer) => (
                    <tr key={customer.id}>
                      <td>
                        <input
                          type="checkbox"
                          checked={selectedCustomers.includes(customer.id)}
                          onChange={() => handleSelectCustomer(customer.id)}
                        />
                      </td>
                      <td>{customer.name}</td>
                      <td>{customer.email}</td>
                      <td>{customer.location}</td>
                      <td>
                        {new Date(customer.created_at).toLocaleDateString()}
                      </td>

                      <td>
                        <span
                          className={
                            customer.account_status === "active"
                              ? "badge bg-success"
                              : "badge bg-secondary"
                          }
                        >
                          {t(customer.account_status)}
                        </span>
                      </td>
                      <td>
                        <button
                          className="show_detail_btn"
                          onClick={() => handleShowDetails(customer.id)}
                        >
                          {t("showDetails")}
                        </button>
                      </td>
                      <td>
                        <div className="action_adminCustomer_btn">
                          <button
                            className="adminCustomer_edit_btn"
                            onClick={() => handleEditCustomer(customer.id)}
                            disabled={selectedCustomers.length > 0}
                            style={{
                              cursor:
                                selectedCustomers.length > 0
                                  ? "not-allowed"
                                  : "pointer",
                            }}
                          >
                            <MdModeEdit /> {t("edit")}
                          </button>

                          <button
                            className="delete"
                            onClick={() => handleDeleteClick(customer.id)}
                            disabled={selectedCustomers.length > 0}
                            style={{
                              cursor:
                                selectedCustomers.length > 0
                                  ? "not-allowed"
                                  : "pointer",
                            }}
                          >
                            <MdDelete /> {t("delete")}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center">
                      {t("noCustomersFound")}
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
          <ConfirmDeleteModal
            show={deleteModal}
            message={t("deleteCustomerConfirm")}
            onConfirm={handleDeleteCustomer}
            onCancel={() => {
              setDeleteModal(false);
              setDeleteCustomerId(null);
            }}
            isDeleting={isDeleting}
          />

          {showCustomerForm && (
            <div className="modal fade show" style={{ display: "block" }}>
              <div className="modal-dialog modal-md modal-dialog-centered">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title">{t("addCustomer")}</h5>
                    <button
                      className="btn-close"
                      onClick={() => setShowCustomerForm(false)}
                    />
                  </div>

                  <div className="modal-body">
                    <input
                      className="form-control mb-3"
                      placeholder={t("firstName")}
                      name="FirstName"
                      value={customerForm.FirstName}
                      onChange={handleCustomerChange}
                    />

                    <input
                      className="form-control mb-3"
                      placeholder={t("lastName")}
                      name="LastName"
                      value={customerForm.LastName}
                      onChange={handleCustomerChange}
                    />

                    <input
                      className="form-control mb-3"
                      placeholder={t("email")}
                      name="Email"
                      value={customerForm.Email}
                      onChange={handleCustomerChange}
                    />

                    <input
                      className="form-control mb-3"
                      placeholder={t("phone")}
                      name="Phone"
                      value={customerForm.Phone}
                      onChange={handleCustomerChange}
                    />

                    <input
                      className="form-control"
                      placeholder={t("location")}
                      name="Location"
                      value={customerForm.Location}
                      onChange={handleCustomerChange}
                    />
                  </div>

                  <div className="modal-footer">
                    <button
                      className="btn btn-secondary"
                      onClick={() => setShowCustomerForm(false)}
                    >
                      {t("cancel")}
                    </button>

                    <button
                      className="btn submit-btn-primary"
                      onClick={handleCreateCustomer}
                      disabled={isloading}
                    >
                      {isloading ? t("loading") + "..." : t("submit")}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {showDetailsModal && (
            <div className="modal fade show" style={{ display: "block" }}>
              <div className="modal-dialog modal-lg modal-dialog-centered">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title">{t("customerDetails")}</h5>
                    <button
                      className="btn-close"
                      onClick={() => setShowDetailsModal(false)}
                    />
                  </div>

                  <div
                    className="modal-body"
                    style={{ maxHeight: "70vh", overflowY: "auto" }}
                  >
                    {!customerDetails ? (
                      <p>{t("loading")}</p>
                    ) : (
                      <>
                        <p>
                          <strong>{t("name")}:</strong>{" "}
                          {customerDetails.name || "-"}
                        </p>
                        <p>
                          <strong>{t("email")}:</strong>{" "}
                          {customerDetails.email || "-"}
                        </p>
                        <p>
                          <strong>{t("phone")}:</strong>{" "}
                          {customerDetails.phone || "-"}
                        </p>
                        {/* <p>
                          <strong>{t("address")}:</strong>{" "}
                          {customerDetails.address || "-"}
                        </p> */}
                        <p>
                          <strong>{t("city")}:</strong>{" "}
                          {customerDetails.city || "-"}
                        </p>
                        {/* <p>
                          <strong>{t("country")}:</strong>{" "}
                          {customerDetails.country || "-"}
                        </p> */}

                        <p>
                          <strong>{t("status")}:</strong>{" "}
                          {customerDetails.status || "-"}
                        </p>

                        <p>
                          <strong>{t("createdAt")}:</strong>{" "}
                          {new Date(
                            customerDetails.created_at,
                          ).toLocaleString()}
                        </p>
                        <hr />
                        <h6 className="fw-bold mb-2">{t("services")}</h6>
                        {customerDetails.services?.length > 0 ? (
                          customerDetails.services.map((service, index) => (
                            <div
                              key={index}
                              className="border rounded p-2 mb-2"
                            >
                              <p>
                                <strong>{t("serviceName")}:</strong>{" "}
                                {service.service_name}
                              </p>
                              <p>
                                <strong>{t("status")}:</strong> {service.status}
                              </p>
                              <p>
                                <strong>{t("price")}:</strong> ₹{service.price}
                              </p>
                              <p>
                                <strong>{t("billingCycle")}:</strong>{" "}
                                {service.billing_cycle}
                              </p>
                              <p>
                                <strong>{t("renewalDate")}:</strong>{" "}
                                {service.renewal_date}
                              </p>
                            </div>
                          ))
                        ) : (
                          <p>{t("noServicesFound")}</p>
                        )}

                        <hr />

                        <h6 className="fw-bold mb-2">
                          {t("escalationForms")}(
                          {customerDetails.estimation_forms?.total || 0})
                        </h6>

                        {customerDetails.estimation_forms?.forms?.length > 0 ? (
                          customerDetails.estimation_forms.forms.map((form) => (
                            <div
                              key={form.id}
                              className="border rounded p-2 mb-2"
                            >
                              <p>
                                <strong>{t("title")}:</strong> {form.title}
                              </p>
                              <p>
                                <strong>{t("status")}:</strong> {form.status}
                              </p>
                              <p>
                                <strong>{t("createdAt")}:</strong>{" "}
                                {new Date(form.created_at).toLocaleString()}
                              </p>
                            </div>
                          ))
                        ) : (
                          <p>{t("noEscalationFormsFound")}</p>
                        )}
                      </>
                    )}
                  </div>

                  <div className="modal-footer">
                    <button
                      className="btn btn-secondary"
                      onClick={() => setShowDetailsModal(false)}
                    >
                      {t("close")}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {showEditModal && (
            <div className="modal fade show" style={{ display: "block" }}>
              <div className="modal-dialog modal-md modal-dialog-centered">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title">{t("editCustomer")}</h5>
                    <button
                      className="btn-close"
                      onClick={() => setShowEditModal(false)}
                    />
                  </div>

                  <div className="modal-body">
                    <h6 className="mb-1 fw-bold">First Name</h6>
                    <input
                      type="text"
                      className="form-control mb-3"
                      name="first_name"
                      value={editCustomerForm.first_name}
                      onChange={handleEditChange}
                    />

                    <h6 className="mb-1 fw-bold">Last Name</h6>
                    <input
                      type="text"
                      className="form-control mb-3"
                      name="last_name"
                      value={editCustomerForm.last_name}
                      onChange={handleEditChange}
                    />

                    <h6 className="mb-1 fw-bold">Email</h6>
                    <input
                      type="email"
                      className="form-control mb-3"
                      name="email"
                      value={editCustomerForm.email}
                      onChange={handleEditChange}
                    />

                    <h6 className="mb-1 fw-bold">Phone</h6>
                    <input
                      type="text"
                      className="form-control mb-3"
                      name="phone"
                      value={editCustomerForm.phone}
                      onChange={handleEditChange}
                    />

                    <h6 className="mb-1 fw-bold">City</h6>
                    <input
                      type="text"
                      className="form-control"
                      name="city"
                      value={editCustomerForm.city}
                      onChange={handleEditChange}
                    />
                  </div>

                  <div className="modal-footer ">
                    <button
                      className="btn btn-secondary"
                      onClick={() => {
                        setShowEditModal(false);
                        setSelectedCustomers([]);
                        setBulkEditIndex(0);
                      }}
                      disabled={isloading}
                    >
                      Close
                    </button>

                    <button
                      className="btn update-btn-primary"
                      onClick={handleUpdateCustomer}
                      disabled={isloading}
                    >
                      {isloading
                        ? "Updating..."
                        : selectedCustomers.length > 0 &&
                            bulkEditIndex < selectedCustomers.length - 1
                          ? "Update & Next"
                          : "Update"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default AdminCustomer;
