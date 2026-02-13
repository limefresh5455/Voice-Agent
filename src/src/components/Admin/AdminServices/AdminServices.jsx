import axiosInstance from "../../Interceptor/Interceptor";

export const Admin = async (userDetails) => {
  console.log(userDetails, "userDetails");
  try {
    const res = await axiosInstance.post(`/admin/create_customer`, userDetails);
    return res.data;
  } catch (error) {
    console.log("Error fetching SuperAdmin");
    throw error;
  }
};
export const editCustomer = async ({ customer_id, ...userDetails }) => {
  try {
    const res = await axiosInstance.patch(
      `/admin/update_customer/${customer_id}`,
      userDetails,
    );
    return res.data;
  } catch (error) {
    console.log("Error updating user:", error);
    throw error;
  }
};
export const deleteCustomer = async ({ customer_id }) => {
  try {
    const res = await axiosInstance.delete(
      `/admin/delete-customer/${customer_id}`,
    );
    return res;
  } catch (error) {
    console.error("Error deleting user:", error);
    throw error;
  }
};

export const inviteCustomer = async (customer_id) => {
  const id = customer_id.customer_id;

  try {
    const res = await axiosInstance.post(``);
    return res.data;
  } catch (error) {
    throw error;
  }
};

export const GetCustomer = async () => {
  try {
    const res = await axiosInstance.get(`/admin/get_all_customer`);
    return res;
  } catch (error) {
    throw error;
  }
};

export const AddCategory = async (payload) => {
  try {
    const res = await axiosInstance.post(`/issues/category`, payload);
    return res;
  } catch (error) {
    throw error;
  }
};

export const ListCategories = async () => {
  try {
    const res = await axiosInstance.get(`/issues/full`);
    return res;
  } catch (error) {
    throw error;
  }
};

export const GetAllResolutionList = async () => {
  try {
    const res = await axiosInstance.get(`/issues/full`);
    return res;
  } catch (error) {
    throw error;
  }
};

export const AddIssue = async (category_id, payload) => {
  try {
    const res = await axiosInstance.post(
      `/issues/category/${category_id}/issue`,
      payload,
    );
    return res;
  } catch (error) {
    throw error;
  }
};

export const ListIssues = async (category_id) => {
  try {
    const res = await axiosInstance.get(`/issues/issues/${category_id}`);
    return res;
  } catch (error) {
    throw error;
  }
};

export const AddSteps = async (issue_id, payload) => {
  try {
    const res = await axiosInstance.post(`/issues/steps/${issue_id}`, payload);
    return res;
  } catch (error) {
    throw error;
  }
};

export const ListSteps = async (issue_id) => {
  try {
    const res = await axiosInstance.get(`/issues/steps/${issue_id}`);
    return res;
  } catch (error) {
    throw error;
  }
};
export const CreateResolutions = async (payload) => {
  try {
    const res = await axiosInstance.post(`/issues/add`, payload);
    return res;
  } catch (error) {
    throw error;
  }
};

export const UploadAndProcessFile = async (user_id, formdata) => {
  try {
    const res = await axiosInstance.post(
      `/admin/upload-and-process/?user_id=${user_id}`,
      formdata,
    );
    return res;
  } catch (error) {
    throw error;
  }
};
//-----------------------------------------------------------------------------
export const GetFormDetails = async () => {
  try {
    const res = await axiosInstance.get(`/admin/dashboard/all-customer-forms`);

    return res.data;
  } catch (error) {
    console.error("Error fetching all customer forms:", error);
    throw error;
  }
};

export const ShowCustomerFormDetails = async (form_id) => {
  try {
    const res = await axiosInstance.get(
      `/admin/dashboard/customer-form/${form_id}`,
    );
    return res.data;
  } catch (error) {
    console.error("Error fetching all customer forms:", error);
    throw error;
  }
};

export const AddAssignForm = async (form_id) => {
  try {
    const res = await axiosInstance.post(
      `/admin/dashboard/customer-form/${form_id}/assign`,
    );

    return res.data;
  } catch (error) {
    throw error;
  }
};

export const AddInResolveQuery = async (form_id) => {
  try {
    const res = await axiosInstance.post(
      `/admin/dashboard/customer-form/${form_id}/resolve`,
    );

    return res.data;
  } catch (error) {
    throw error;
  }
};

export const DeleteQueryForm = async (payload) => {
  try {
    const res = await axiosInstance.delete(
      `/admin/dashboard/customer-form/delete`,
      {
        data: payload,
      },
    );
    return res.data;
  } catch (error) {
    throw error;
  }
};

export const ShowCustomerDetails = async (customer_id) => {
  try {
    const res = await axiosInstance.get(
      `/admin/dashboard/customer/${customer_id}`,
    );
    return res.data;
  } catch (error) {
    console.error("Error fetching all customer forms:", error);
    throw error;
  }
};

export const AIAgentSummaryAPI = async (form_id) => {
  try {
    const res = await axiosInstance.get(`/chatbot/ai_agent_summary/${form_id}`);
    return res?.data;
  } catch (error) {
    throw error;
  }
};
export const CreateCustomerAPI = async (payload) => {
  try {
    const res = await axiosInstance.post(
      "/admin/dashboard/customer/create",
      payload,
    );
    return res?.data;
  } catch (error) {
    throw error;
  }
};

export const GetCustomerList = async () => {
  try {
    const res = await axiosInstance.get(`/admin/customers/list`);
    return res;
  } catch (error) {
    throw error;
  }
};

export const ShowServicesList = async () => {
  try {
    const res = await axiosInstance.get(`/admin/services_name`);
    return res.data;
  } catch (error) {
    console.error("Error fetching all customer forms:", error);
    throw error;
  }
};
// ----------------------------------------------------------------------

export const AddCustomerServices = async (customer_id, payload) => {
  try {
    const res = await axiosInstance.post(
      `/admin/customer/${customer_id}/services`,
      payload,
    );
    return res;
  } catch (error) {
    throw error;
  }
};

export const DeleteCustomerService = async (payload) => {
  try {
    const res = await axiosInstance.delete(`/admin/customer/services/`, {
      data: payload,
    });
    return res.data;
  } catch (error) {
    throw error;
  }
};

export const GetAllServices = async () => {
  try {
    const res = await axiosInstance.get(`/admin/org/services`);
    return res;
  } catch (error) {
    console.error("Error fetching all customer forms:", error);
    throw error;
  }
};

export const CreateServices = async (payload) => {
  try {
    const res = await axiosInstance.post(
      `/admin/services_name_lookup`,
      payload,
    );
    return res;
  } catch (error) {
    throw error;
  }
};
export const editServices = async ({ customer_id, service_id, ...payload }) => {
  try {
    const res = await axiosInstance.put(
      `/admin/customers/${customer_id}/services/${service_id}`,
      payload,
    );
    return res.data;
  } catch (error) {
    console.log("Error updating service:", error);
    throw error;
  }
};

export const GetServiceDetails = async (customer_service_id) => {
  try {
    const res = await axiosInstance.get(
      `/admin/org/services/${customer_service_id}`,
    );
    return res;
  } catch (error) {
    console.error("Error fetching all customer forms:", error);
    throw error;
  }
};
//---------------------------Customers APIs---------------------------------

export const CreateCustomer = async (payload) => {
  try {
    const res = await axiosInstance.post(
      `/admin/dashboard/customer_by_admin/create`,
      payload,
    );
    return res;
  } catch (error) {
    throw error;
  }
};

export const GetAllCustomers = async () => {
  try {
    const res = await axiosInstance.get(`/admin/dashboard/customer/list`);
    return res;
  } catch (error) {
    console.error("Error fetching all customer:", error);
    throw error;
  }
};

export const GetAdminCustomerDetails = async (customer_id) => {
  try {
    const res = await axiosInstance.get(
      `/admin/dashboard/customer/${customer_id}`,
    );
    return res;
  } catch (error) {
    console.error("Error fetching all customer forms:", error);
    throw error;
  }
};

export const editAdminCustomer = async (customerData) => {
  try {
    const res = await axiosInstance.put(
      "/admin/dashboard/customer/edit",
      customerData,
    );
    return res.data;
  } catch (error) {
    console.log(
      "Error updating customer:",
      error.response?.data || error.message,
    );
    throw error;
  }
};

export const DeleteAdminCustomer = async (payload) => {
  try {
    const res = await axiosInstance.delete(`/admin/dashboard/delete`, {
      data: payload,
    });
    return res.data;
  } catch (error) {
    throw error;
  }
};

// ------------------------------------------------------------------------

export const GetAllLeads = async () => {
  try {
    const res = await axiosInstance.get(`/admin/dashboard/all-lead-forms`);
    return res;
  } catch (error) {
    console.error("Error fetching all customer:", error);
    throw error;
  }
};

export const deleteLead = async (payload) => {
  try {
    const res = await axiosInstance.delete(
      `/admin/dashboard/customer-lead/delete`,
      {
        data: payload,
      },
    );
    return res;
  } catch (error) {
    console.error("Error deleting user:", error);
    throw error;
  }
};

export const GetLeadFormDetails = async (lead_id) => {
  try {
    const res = await axiosInstance.get(
      `/admin/dashboard/customer-lead/${lead_id}`,
    );
    return res;
  } catch (error) {
    console.error("Error fetching all customer forms:", error);
    throw error;
  }
};

export const AddAssignLeadForm = async (lead_id) => {
  try {
    const res = await axiosInstance.post(
      `/admin/dashboard/lead-form/${lead_id}/assign`,
    );

    return res.data;
  } catch (error) {
    throw error;
  }
};

export const ResolveLeadQuery = async (lead_id) => {
  try {
    const res = await axiosInstance.post(
      `/admin/dashboard/lead-form/${lead_id}/resolve`,
    );
    return res.data;
  } catch (error) {
    throw error;
  }
};
