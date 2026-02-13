import axiosInstance from "../../Interceptor/Interceptor";

export const CreateAdmin = async (payload) => {
  try {
    const res = await axiosInstance.post(`/org/admin/create`, payload);
    return res;
  } catch (error) {
    throw error;
  }
};

export const GetAdminsList = async () => {
  try {
    const res = await axiosInstance.get(`/org/admin/list`);
    return res;
  } catch (error) {
    throw error;
  }
};

export const CreateCustomer = async (payload) => {
  try {
    const res = await axiosInstance.post(`/org/customer/create`, payload);
    return res;
  } catch (error) {
    throw error;
  }
};

export const GetCustomersList = async () => {
  try {
    const res = await axiosInstance.get(`/org/customer/list`);
    return res;
  } catch (error) {
    throw error;
  }
};

export const deleteAdmin = async (payload) => {
  try {
    const res = await axiosInstance.delete(`/org/admin/delete`, {
      data: payload,
    });
    return res;
  } catch (error) {
    console.error("Error deleting user:", error);
    throw error;
  }
};

export const UploadFile = async (formData) => {
  try {
    const res = await axiosInstance.post(`/org/customer/upload-json`, formData);
    return res;
  } catch (error) {
    throw error;
  }
};
export const DeleteCustomer = async (payload) => {
  try {
    const res = await axiosInstance.delete(`/org/customer/delete`, {
      data: payload,
    });
    return res;
  } catch (error) {
    console.error("Error deleting user:", error);
    throw error;
  }
};

export const VerifyCustomerAPI = async (payload) => {
  try {
    const res = await axiosInstance.post(`/chatbot/verify-customer`, payload);
    return res;
  } catch (error) {
    console.error("Error verifying customer:", error);
    throw error;
  }
};

export const AskQuestionAPI = async (payload) => {
  try {
    const res = await axiosInstance.post(`/chatbot/ask-question`, payload);
    return res;
  } catch (error) {
    console.error("Error asking question:", error);
    throw error;
  }
};

export const SubmitEscalationFormAPI = async (payload) => {
  try {
    const res = await axiosInstance.post("/chatbot/escalation-form", payload);
    return res;
  } catch (error) {
    console.error("Error submitting escalation form:", error);
    throw error;
  }
};

export const EndChatSummaryAPI = async (payload) => {
  try {
    const res = await axiosInstance.post(`/chatbot/end-chat-summary`, payload);
    return res;
  } catch (error) {
    console.error("Error sending chat summary:", error);
    throw error;
  }
};

export const UploadIssuesFile = async (formData) => {
  try {
    const res = await axiosInstance.post(
      `/org/issues/import-preview`,
      formData,
    );
    return res;
  } catch (error) {
    throw error;
  }
};

export const GetIssues = async (organization) => {
  try {
    const res = await axiosInstance.get(`/org/all-category/${organization}`);
    return res.data;
  } catch (error) {
    console.error("Error fetching issues:", error);
    throw error;
  }
};

export const ShowIssuesDetail = async (issue_id, organization_id) => {
  try {
    const res = await axiosInstance.get(`/org/issue-details/${issue_id}`, {
      params: { organization: organization_id },
    });
    console.log("apires", res);
    return res;
  } catch (error) {
    throw error;
  }
};

export const deleteIssue = async (payload) => {
  try {
    const res = await axiosInstance.delete(`/org/issue`, {
      data: payload,
    });
    return res;
  } catch (error) {
    console.error("Error deleting user:", error);
    throw error;
  }
};

export const ShowAdminDetails = async (admin_id) => {
  try {
    const res = await axiosInstance.get(`/org/admin/detail/${admin_id}`);
    return res.data;
  } catch (error) {
    console.error("Error fetching all customer forms:", error);
    throw error;
  }
};

export const EditAdminDetails = async (customer_id) => {
  try {
    const res = await axiosInstance.get(`/org/customer/detail/${customer_id}`);
    return res.data;
  } catch (error) {
    console.error("Error fetching all customer forms:", error);
    throw error;
  }
};

export const UpdateCustomer = async (payload) => {
  try {
    const res = await axiosInstance.put(
      `/org/customer/edit`,
      Array.isArray(payload) ? payload : [payload],
    );
    return res.data;
  } catch (error) {
    throw error;
  }
};

export const UpdateIssues = async (issue_id, payload) => {
  try {
    const res = await axiosInstance.put(
      `/org/issues-detail/${issue_id}`,
      payload,
    );
    return res.data;
  } catch (error) {
    console.error("Error updating issue:", error);
    throw error;
  }
};

export const SpeachToText = async (formdata) => {
  try {
    const res = await axiosInstance.post(`/chatbot/speech-to-text`, formdata);
    return res;
  } catch (error) {
    throw error;
  }
};

export const ContinueForNotVerified = async (payload) => {
  try {
    const res = await axiosInstance.post(
      `/chatbot/ask-question-nonverified`,
      payload,
    );
    return res;
  } catch (error) {
    throw error;
  }
};

export const NotVerifiedEscalation = async (payload) => {
  try {
    const res = await axiosInstance.post(`/chatbot/leads/submit-form`, payload);
    return res;
  } catch (error) {
    throw error;
  }
};

export const CreateIssue = async (payload) => {
  try {
    const res = await axiosInstance.post(`/org/issues/create`, payload);
    return res;
  } catch (error) {
    throw error;
  }
};

export const GetIssuesForCategory = async (category_id) => {
  try {
    const res = await axiosInstance.get(
      `/org/categories/${category_id}/issues`,
    );
    return res.data;
  } catch (error) {
    console.error("Error fetching issues:", error);
    throw error;
  }
};

export const ImportIssuesWithMapping = async (formData) => {
  try {
    const res = await axiosInstance.post(
      `/org/issues/import-with-mapping`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );
    return res;
  } catch (error) {
    throw error;
  }
};
