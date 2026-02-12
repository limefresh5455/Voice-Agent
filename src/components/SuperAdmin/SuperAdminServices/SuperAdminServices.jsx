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

export const GetOrganizationsList = async () => {
  try {
    const res = await axiosInstance.get(`/super/organization-list`);
    return res;
  } catch (error) {
    throw error;
  }
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

export const UpdateOrganizationDetails = async (org_id, payload) => {
  try {
    const res = await axiosInstance.put(
      `/super/edit-organization/${org_id}`,
      payload,
    );
    return res.data;
  } catch (error) {
    console.error("Error updating organization:", error);
    throw error;
  }
};
