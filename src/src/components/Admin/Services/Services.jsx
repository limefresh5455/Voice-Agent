import React, { useState, useEffect } from "react";
import AdminSidebar from "../AdminSidebar";
import Loading from "../../CommonComponent/Loading/Loading";
import { FaBars, FaRobot } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import AdminHeader from "../AdminHeader/AdminHeader";
import { RiAdminFill } from "react-icons/ri";
import { MdModeEdit, MdDelete } from "react-icons/md";
import {
  AddCustomerServices,
  CreateServices,
  DeleteCustomerService,
  editServices,
  GetAllServices,
  GetCustomerList,
  GetServiceDetails,
  ShowServicesList,
} from "../AdminServices/AdminServices";

import ConfirmDeleteModal from "../../CommonComponent/ConfirmDeleteModal/ConfirmDeleteModal";
import { toast } from "react-toastify";

function Services() {
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(true);
  const [isloading, setIsLoading] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const { t } = useTranslation();
  const [showServiceForm, setShowServiceForm] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [loadingServices, setLoadingServices] = useState(false);
  const [servicesTableList, setServicesTableList] = useState([]);
  const [serviceDropdownList, setServiceDropdownList] = useState([]);
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleteData, setDeleteData] = useState({
    customerId: null,
    customerServiceId: null,
  });
  const [newServiceName, setNewServiceName] = useState("");
  const [isCreatingService, setIsCreatingService] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [serviceDetails, setServiceDetails] = useState(null);
  const [selectedServices, setSelectedServices] = useState([]);
  const [bulkEditIndex, setBulkEditIndex] = useState(0);
  const [bulkEditData, setBulkEditData] = useState([]);
  const [isBulkEditing, setIsBulkEditing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const isBulkMode = selectedServices.length > 0;
  const pageSize = 20;
  const [isDeleting, setIsDeleting] = useState(false);
  const [editForm, setEditForm] = useState({
    customer_id: null,
    service_id: null,
    service_status: "",
    price: "",
    billing_cycle: "",
  });

  const [serviceForm, setServiceForm] = useState({
    service_name_id: "",
    service_start_date: "",
    service_end_date: "",
    service_status: "",
    price: "",
    billing_cycle: "",
    renewal_date: "",
  });
  const toggleLeftSidebar = () => {
    setLeftSidebarOpen((prev) => !prev);
  };
  const handleAddServices = () => {
    setShowServiceForm(true);
  };
  const fetchCustomers = async () => {
    setLoadingCustomers(true);
    try {
      const res = await GetCustomerList();
      const data = res.data;

      if (Array.isArray(data.customers?.data)) {
        setCustomers(data.customers.data);
      } else {
        setCustomers([]);
      }
    } catch (err) {
      console.error("Failed to fetch customers:", err);
      setCustomers([]);
    } finally {
      setLoadingCustomers(false);
    }
  };

  useEffect(() => {
    if (!showServiceForm) return;
    fetchCustomers();
  }, [showServiceForm]);

  const handleServiceInputChange = (e) => {
    const { name, value } = e.target;
    setServiceForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmitService = async () => {
    if (!selectedCustomerId) {
      toast.warning(t("toastSelectCustomer"));
      return;
    }

    const payload = {
      service_name_id: Number(serviceForm.service_name_id),
      service_start_date: serviceForm.service_start_date,
      service_end_date: serviceForm.service_end_date,
      service_status: serviceForm.service_status,
      price: Number(serviceForm.price),
      billing_cycle: serviceForm.billing_cycle,
      renewal_date: serviceForm.renewal_date,
    };

    try {
      setIsLoading(true);
      await AddCustomerServices(selectedCustomerId, payload);

      await fetchAllServices();
      toast.success(t("toastServiceAdded"));
      setShowServiceForm(false);
      setServiceForm({
        service_name_id: "",
        service_start_date: "",
        service_end_date: "",
        service_status: "",
        price: "",
        billing_cycle: "",
        renewal_date: "",
      });
      setSelectedCustomerId("");
    } catch (error) {
      console.error("Add service error:", error);
      toast.error(t("toastAddServiceFailed"));
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    if (!showServiceForm) return;

    const fetchServiceNames = async () => {
      const res = await ShowServicesList();
      setServiceDropdownList(res.services || []);
    };

    fetchServiceNames();
  }, [showServiceForm]);

  const fetchAllServices = async (page = 1) => {
    try {
      setLoadingServices(true);

      const res = await GetAllServices(page, pageSize);
      console.log("SERVICES API RESPONSE:", res.data);

      const responseData = res.data;

      const serviceList =
        responseData.services ||
        responseData.data?.services ||
        responseData.data ||
        [];

      const tableData = serviceList
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .map((service) => ({
          customerId: service.customer?.id,
          customerName: service.customer?.name,
          serviceName: service.service_name,
          price: service.price,
          status: service.status,
          billingCycle: service.billing_cycle,
          customerServiceId: service.customer_service_id,
        }));

      setServicesTableList(tableData);

      setTotalCount(responseData.total || responseData.data?.total || 0);
      setTotalPages(
        responseData.total_pages || responseData.data?.total_pages || 1,
      );
      setCurrentPage(responseData.page || responseData.data?.page || 1);
    } catch (err) {
      console.error("Failed to fetch services:", err);
      setServicesTableList([]);
    } finally {
      setLoadingServices(false);
    }
  };

  useEffect(() => {
    fetchAllServices(currentPage);
  }, [currentPage]);

  const handleCreateService = async () => {
    if (!newServiceName.trim()) {
      toast.warning(t("toastEnterServiceName"));

      return;
    }
    try {
      setIsCreatingService(true);

      const payload = {
        service_name: newServiceName,
      };

      const res = await CreateServices(payload);
      const createdService = res.data;
      const listRes = await ShowServicesList();
      setServiceDropdownList(listRes.services || []);
      setServiceForm((prev) => ({
        ...prev,
        service_name_id: createdService.id,
      }));

      setNewServiceName("");
      toast.success(t("toastServiceCreated"));
    } catch (err) {
      console.error("Create service error:", err);
      toast.error(t("toastCreateServiceFailed"));
    } finally {
      setIsCreatingService(false);
    }
  };

  const handleUpdateService = async () => {
    try {
      const payload = [
        {
          customer_id: editForm.customer_id,
          services: [
            {
              service_id: editForm.service_id,
              service_status: editForm.service_status,
              price: Number(editForm.price),
              billing_cycle: editForm.billing_cycle,
            },
          ],
        },
      ];
      await editServices(payload);
      toast.success(t("toastServiceUpdated"));
      setShowEditModal(false);
      await fetchAllServices();
    } catch (error) {
      toast.error(t("toastUpdateServiceFailed"));
    }
  };

  const handleShowDetails = async (customerServiceId) => {
    try {
      setLoadingDetail(true);
      const res = await GetServiceDetails(customerServiceId);
      setServiceDetails(res.data);
      setShowDetailsModal(true);
    } catch (error) {
      toast.error(t("toastFetchDetailsFailed"));
    } finally {
      setLoadingDetail(false);
    }
  };

  useEffect(() => {
    const isAnyModalOpen =
      showServiceForm || showEditModal || showDetailsModal || deleteModal;

    if (isAnyModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [showServiceForm, showEditModal, showDetailsModal, deleteModal]);

  const handleSelectRow = (customerId, serviceId) => {
    setSelectedServices((prev) => {
      const exists = prev.find(
        (item) =>
          item.customerId === customerId && item.serviceId === serviceId,
      );

      if (exists) {
        return prev.filter(
          (item) =>
            !(item.customerId === customerId && item.serviceId === serviceId),
        );
      } else {
        return [...prev, { customerId, serviceId }];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedServices.length === servicesTableList.length) {
      setSelectedServices([]);
    } else {
      const all = servicesTableList.map((service) => ({
        customerId: service.customerId,
        serviceId: service.customerServiceId,
      }));
      setSelectedServices(all);
    }
  };
  const handleBulkOrSingleDelete = async () => {
    try {
      setIsDeleting(true);
      let payload;
      if (selectedServices.length > 0) {
        const grouped = selectedServices.reduce((acc, item) => {
          const existing = acc.find((c) => c.customer_id === item.customerId);
          if (existing) {
            existing.service_ids.push(item.serviceId);
          } else {
            acc.push({
              customer_id: item.customerId,
              service_ids: [item.serviceId],
            });
          }
          return acc;
        }, []);
        payload = { customers: grouped };
        await DeleteCustomerService(payload);
        setSelectedServices([]);
      } else if (deleteData.customerId) {
        payload = {
          customers: [
            {
              customer_id: deleteData.customerId,
              service_ids: [deleteData.customerServiceId],
            },
          ],
        };
        await DeleteCustomerService(payload);
      }

      toast.success(t("toastServiceDeleted"));
      await fetchAllServices();
    } catch (error) {
      toast.error(t("toastDeleteServiceFailed"));
    } finally {
      setIsDeleting(false);
      setDeleteModal(false);
      setDeleteData({ customerId: null, customerServiceId: null });
    }
  };

  const startBulkEdit = () => {
    if (selectedServices.length === 0) return;

    const firstService = servicesTableList.find(
      (service) =>
        service.customerServiceId === selectedServices[0].serviceId &&
        service.customerId === selectedServices[0].customerId,
    );

    setEditForm({
      customer_id: firstService.customerId,
      service_id: firstService.customerServiceId,
      service_status: firstService.status,
      price: firstService.price,
      billing_cycle: firstService.billingCycle,
    });

    setBulkEditIndex(0);
    setBulkEditData([]);
    setIsBulkEditing(true);
    setShowEditModal(true);
  };

  const handleUpdateAndNext = () => {
    const current = editForm;

    setBulkEditData((prev) => {
      const existingCustomerIndex = prev.findIndex(
        (item) => item.customer_id === current.customer_id,
      );

      if (existingCustomerIndex !== -1) {
        const updated = [...prev];
        updated[existingCustomerIndex].services.push({
          service_id: current.service_id,
          service_status: current.service_status,
          price: Number(current.price),
          billing_cycle: current.billing_cycle,
        });
        return updated;
      } else {
        return [
          ...prev,
          {
            customer_id: current.customer_id,
            services: [
              {
                service_id: current.service_id,
                service_status: current.service_status,
                price: Number(current.price),
                billing_cycle: current.billing_cycle,
              },
            ],
          },
        ];
      }
    });

    if (bulkEditIndex < selectedServices.length - 1) {
      const nextServiceId = selectedServices[bulkEditIndex + 1].serviceId;
      const nextCustomerId = selectedServices[bulkEditIndex + 1].customerId;

      const nextService = servicesTableList.find(
        (service) =>
          service.customerServiceId === nextServiceId &&
          service.customerId === nextCustomerId,
      );

      setEditForm({
        customer_id: nextService.customerId,
        service_id: nextService.customerServiceId,
        service_status: nextService.status,
        price: nextService.price,
        billing_cycle: nextService.billingCycle,
      });

      setBulkEditIndex((prev) => prev + 1);
    } else {
      saveBulkEdits();
    }
  };

  const saveBulkEdits = async () => {
    try {
      setIsLoading(true);
      await editServices(bulkEditData);
      toast.success(t("toastServiceUpdated"));
      setShowEditModal(false);
      setIsBulkEditing(false);
      setSelectedServices([]);
      setBulkEditData([]);
      setBulkEditIndex(0);
      await fetchAllServices();
    } catch (error) {
      console.error("Bulk update failed:", error);
      toast.error(t("toastUpdateServiceFailed"));
    } finally {
      setIsLoading(false);
    }
  };

  const openSingleEditModal = (service) => {
    setEditForm({
      customer_id: service.customerId,
      service_id: service.customerServiceId,
      service_status: service.status,
      price: service.price,
      billing_cycle: service.billingCycle,
    });
    setIsBulkEditing(false);
    setShowEditModal(true);
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
              <h3 className="admin_head">{t("servicesPageTitle")}</h3>
            </div>
            <button className="add_btn01" onClick={handleAddServices}>
              <RiAdminFill className="admin_icon" />
              {t("addServices")}
            </button>
          </div>
          {selectedServices.length > 0 && (
            <div className="d-flex justify-content-between align-items-center mb-3 p-2 bg-light border rounded">
              <span>{selectedServices.length} selected</span>
              <div className="d-flex gap-2">
                <button className="service_edit_btn" onClick={startBulkEdit}>
                  <MdModeEdit />
                  {t("Edit")}
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
                        servicesTableList.length > 0 &&
                        selectedServices.length === servicesTableList.length
                      }
                      onChange={handleSelectAll}
                    />
                  </th>
                  <th>{t("customerName")}</th>
                  <th>{t("serviceName")}</th>
                  <th>{t("billingCycle")}</th>
                  <th>{t("price")}</th>
                  <th>{t("status")}</th>
                  <th>{t("details")}</th>
                  <th>{t("actions")}</th>
                </tr>
              </thead>
              <tbody>
                {loadingServices ? (
                  <tr>
                    <td colSpan="8" className="text-center py-4">
                      <div className="spinner-border text-primary"></div>
                      <div className="mt-2">{t("loadingServices")}</div>
                    </td>
                  </tr>
                ) : servicesTableList.length > 0 ? (
                  servicesTableList.map((service, index) => (
                    <tr key={index}>
                      <td>
                        <input
                          type="checkbox"
                          checked={selectedServices.some(
                            (item) =>
                              item.customerId === service.customerId &&
                              item.serviceId === service.customerServiceId,
                          )}
                          onChange={() =>
                            handleSelectRow(
                              service.customerId,
                              service.customerServiceId,
                            )
                          }
                        />
                      </td>
                      <td>{service.customerName}</td>
                      <td>{service.serviceName}</td>
                      <td>{service.billingCycle}</td>
                      <td>{service.price}</td>
                      <td>
                        <span
                          className={
                            service.status === "active"
                              ? "badge bg-success"
                              : "badge bg-secondary"
                          }
                        >
                          {t(service.status)}
                        </span>
                      </td>

                      <td>
                        <button
                          className="show_detail_btn"
                          onClick={() =>
                            handleShowDetails(service.customerServiceId)
                          }
                        >
                          {t("showDetails")}
                        </button>
                      </td>

                      <td>
                        <div className="action_service_btn">
                          <button
                            className="service_edit_btn"
                            onClick={() => openSingleEditModal(service)}
                            disabled={isBulkMode}
                          >
                            <MdModeEdit /> {t("edit")}
                          </button>

                          <button
                            className="delete"
                            disabled={isBulkMode}
                            onClick={() => {
                              setDeleteData({
                                customerId: service.customerId,
                                customerServiceId: service.customerServiceId,
                              });
                              setDeleteModal(true);
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
                    <td colSpan="5" className="text-center">
                      {t("noServicesFound")}
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

          {showServiceForm && (
            <div className="modal fade show" style={{ display: "block" }}>
              <div className="modal-dialog modal-lg modal-dialog-centered">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title">{t("addServiceDetails")}</h5>
                    <button
                      className="btn-close"
                      onClick={() => setShowServiceForm(false)}
                    />
                  </div>

                  <div
                    className="modal-body"
                    style={{ maxHeight: "70vh", overflowY: "auto" }}
                  >
                    <div className="mb-4">
                      <label className="form-label fw-semibold">
                        {t("customer")}
                      </label>
                      <select
                        className="form-select"
                        value={selectedCustomerId}
                        onChange={(e) => setSelectedCustomerId(e.target.value)}
                      >
                        <option value="">{t("selectCustomer")}</option>
                        {customers.map((customer) => (
                          <option key={customer.id} value={customer.id}>
                            {customer.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="mb-3">
                      <label className="form-label fw-bold d-block">
                        {t("serviceName")}
                      </label>
                      <small className="text-muted d-block mb-2">
                        {t("selectOrCreateService")}
                      </small>

                      <div className="row g-2">
                        <div className="col-md-6">
                          <select
                            className="form-select"
                            name="service_name_id"
                            value={serviceForm.service_name_id}
                            onChange={(e) => {
                              handleServiceInputChange(e);
                              setNewServiceName("");
                            }}
                            disabled={newServiceName.length > 0}
                          >
                            <option value="">{t("selectService")}</option>
                            {serviceDropdownList.map((service) => (
                              <option key={service.id} value={service.id}>
                                {service.service_name}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="col-md-6">
                          <div className="input-group">
                            <input
                              type="text"
                              className="form-control"
                              placeholder={t("createNewService")}
                              value={newServiceName}
                              onChange={(e) => {
                                setNewServiceName(e.target.value);
                                setServiceForm((prev) => ({
                                  ...prev,
                                  service_name_id: "",
                                }));
                              }}
                              disabled={!!serviceForm.service_name_id}
                            />
                            <button
                              className="btn btn-outline-primary"
                              type="button"
                              onClick={handleCreateService}
                              disabled={
                                isCreatingService || !newServiceName.trim()
                              }
                            >
                              {isCreatingService ? (
                                <span className="spinner-border spinner-border-sm"></span>
                              ) : (
                                t("add")
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="row">
                      <div className="col-md-6 mb-4">
                        <label className="form-label fw-semibold">
                          {t("serviceStartDate")}
                        </label>
                        <input
                          type="date"
                          className="form-control"
                          name="service_start_date"
                          value={serviceForm.service_start_date}
                          onChange={handleServiceInputChange}
                        />
                      </div>

                      <div className="col-md-6 mb-4">
                        <label className="form-label fw-semibold">
                          {t("serviceEndDate")}
                        </label>
                        <input
                          type="date"
                          className="form-control"
                          name="service_end_date"
                          value={serviceForm.service_end_date}
                          onChange={handleServiceInputChange}
                        />
                      </div>
                    </div>

                    <div className="row">
                      <div className="col-md-6 mb-4">
                        <label className="form-label fw-semibold">
                          {t("serviceStatus")}
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder={t("activeInactive")}
                          name="service_status"
                          value={serviceForm.service_status}
                          onChange={handleServiceInputChange}
                        />
                      </div>

                      <div className="col-md-6 mb-4">
                        <label className="form-label fw-semibold">
                          {t("billingCycle")}
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder={t("monthlyYearly")}
                          name="billing_cycle"
                          value={serviceForm.billing_cycle}
                          onChange={handleServiceInputChange}
                        />
                      </div>
                    </div>

                    <div className="row">
                      <div className="col-md-6 mb-4">
                        <label className="form-label fw-semibold">
                          {t("price")}
                        </label>
                        <input
                          type="number"
                          className="form-control"
                          placeholder={t("enterPrice")}
                          name="price"
                          value={serviceForm.price}
                          onChange={handleServiceInputChange}
                        />
                      </div>

                      <div className="col-md-6 mb-4">
                        <label className="form-label fw-semibold">
                          {t("renewalDate")}
                        </label>
                        <input
                          type="date"
                          className="form-control"
                          name="renewal_date"
                          value={serviceForm.renewal_date}
                          onChange={handleServiceInputChange}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="modal-footer">
                    <button
                      className="btn btn-secondary"
                      onClick={() => setShowServiceForm(false)}
                    >
                      {t("close")}
                    </button>
                    <button
                      className="btn submit-btn-primary"
                      onClick={handleSubmitService}
                      disabled={isloading}
                    >
                      {isloading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2"></span>
                          {t("submitting")}
                        </>
                      ) : (
                        t("submit")
                      )}
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
                    <h5 className="modal-title">{t("editService")}</h5>
                    <button
                      className="btn-close"
                      onClick={() => setShowEditModal(false)}
                    />
                  </div>

                  <div className="modal-body">
                    <div className="mb-3">
                      <label className="form-label fw-semibold">
                        {t("serviceStatus")}
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        value={editForm.service_status}
                        onChange={(e) =>
                          setEditForm((prev) => ({
                            ...prev,
                            service_status: e.target.value,
                          }))
                        }
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label fw-semibold">
                        {t("billingCycle")}
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        value={editForm.billing_cycle}
                        onChange={(e) =>
                          setEditForm((prev) => ({
                            ...prev,
                            billing_cycle: e.target.value,
                          }))
                        }
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label fw-semibold">Price</label>
                      <input
                        type="number"
                        className="form-control"
                        value={editForm.price}
                        onChange={(e) =>
                          setEditForm((prev) => ({
                            ...prev,
                            price: e.target.value,
                          }))
                        }
                      />
                    </div>
                  </div>

                  <div className="modal-footer">
                    <button
                      className="btn btn-secondary"
                      onClick={() => {
                        setShowEditModal(false);
                      }}
                      disabled={isloading}
                    >
                      Close
                    </button>

                    <button
                      className="btn update-btn-primary"
                      onClick={
                        isBulkEditing
                          ? handleUpdateAndNext
                          : handleUpdateService
                      }
                      disabled={isloading}
                    >
                      {isloading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2"></span>
                          {isBulkEditing ? "Updating & Next..." : "Updating..."}
                        </>
                      ) : isBulkEditing ? (
                        "Update & Next"
                      ) : (
                        "Update"
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {showDetailsModal && (
            <div className="modal fade show" style={{ display: "block" }}>
              <div className="modal-dialog modal-md modal-dialog-centered">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title">{t("serviceDetails")}</h5>
                    <button
                      className="btn-close"
                      onClick={() => setShowDetailsModal(false)}
                    />
                  </div>

                  <div
                    className="modal-body"
                    style={{ maxHeight: "65vh", overflowY: "auto" }}
                  >
                    {!serviceDetails ? (
                      <p>{t("loading")}</p>
                    ) : (
                      <div className="service-details">
                        <p>
                          <strong>{t("customerName")}:</strong>{" "}
                          {serviceDetails.customer?.name || "-"}
                        </p>

                        <p>
                          <strong>{t("serviceName")}</strong>{" "}
                          {serviceDetails.service?.name || "-"}
                        </p>

                        <p>
                          <strong>{t("status")}:</strong>{" "}
                          {serviceDetails.status || "-"}
                        </p>

                        <p>
                          <strong>{t("billingCycle")}</strong>{" "}
                          {serviceDetails.billing_cycle || "-"}
                        </p>

                        <p>
                          <strong>{t("price")}</strong> ₹
                          {serviceDetails.price ?? "-"}
                        </p>

                        <p>
                          <strong>{t("serviceStartDate")}</strong>{" "}
                          {serviceDetails.service_start_date || "-"}
                        </p>

                        <p>
                          <strong>{t("serviceEndDate")}</strong>{" "}
                          {serviceDetails.service_end_date || "-"}
                        </p>

                        <p>
                          <strong>{t("renewalDate")}</strong>{" "}
                          {serviceDetails.renewal_date || "-"}
                        </p>

                        <p>
                          <strong>{t("createdAt")}:</strong>{" "}
                          {serviceDetails.created_at || "-"}
                        </p>

                        <p>
                          <strong>{t("updatedAt")}:</strong>{" "}
                          {serviceDetails.updated_at || "-"}
                        </p>
                      </div>
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

          <ConfirmDeleteModal
            show={deleteModal}
            message={t("deleteOrgConfirm")}
            isDeleting={isDeleting}
            onConfirm={async () => {
              try {
                setIsDeleting(true);

                await handleBulkOrSingleDelete();
              } finally {
                setIsDeleting(false);
                setDeleteModal(false);
              }
            }}
            onCancel={() => {
              if (!isDeleting) setDeleteModal(false);
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default Services;
