import axiosInstance from "../../Interceptor/Interceptor";

export const SuperAdmin = async (userDetails) => {
  console.log(userDetails, "userDetails");
  try {
    const res = await axiosInstance.post(`/super/create-admin`, userDetails);
    return res;
  } catch (error) {
    console.log("Error fetching SuperAdmin");
    throw error;
  }
};

export const deleteOrganization = async (payload) => {
  try {
    const res = await axiosInstance.delete(`/super/delete-organization`, {
      data: payload,
    });
    return res;
  } catch (error) {
    console.error("Error deleting organization:", error);
    throw error;
  }
};

export const GetOrganizationsList = async (page = 1, page_size = 20) => {
  return axiosInstance.get("/super/organization-list", {
    params: {
      page,
      page_size,
    },
  });
};

export const CreateOrganization = async (payload) => {
  try {
    const res = await axiosInstance.post(`/super/create-organization`, payload);
    return res;
  } catch (error) {
    throw error;
  }
};

export const ShowOrganizationDetail = async (org_id) => {
  try {
    const res = await axiosInstance.get(`/super/organization/${org_id}`);
    return res;
  } catch (error) {
    throw error;
  }
};

export const ShowStatus = async (org_id) => {
  try {
    const res = await axiosInstance.patch(
      `/super/toggle-organization/
      ${org_id}`,
    );
    return res;
  } catch (error) {
    throw error;
  }
};

export const UpdateOrganizationDetails = async (payload) => {
  try {
    const res = await axiosInstance.put(`/super/edit-organization`, payload);
    return res.data;
  } catch (error) {
    console.error("Error updating organization:", error);
    throw error;
  }
};
