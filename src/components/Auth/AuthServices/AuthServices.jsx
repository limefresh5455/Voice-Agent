import axiosInstance from "../../Interceptor/Interceptor";

export const signUpService = async (userDetails) => {
  try {
    const res = await axiosInstance.post("/auth/register/", userDetails);
    return res;
  } catch (error) {
    throw error;
  }
};

export const signInSuperService = async (userDetails) => {
  try {
    const res = await axiosInstance.post("/super/login", userDetails);
    return res;
  } catch (error) {
    throw error;
  }
};

export const signInAdminServices = async (userDetails) => {
  try {
    const res = await axiosInstance.post("/admin/login", userDetails);
    return res;
  } catch (error) {
    throw error;
  }
};

export const signInOrganizationService = async (userDetails) => {
  try {
    const res = await axiosInstance.post("/organization/login", userDetails);
    return res;
  } catch (error) {
    throw error;
  }
};

export const signInServices = async (userDetails) => {
  try {
    const res = await axiosInstance.post("/user/login", userDetails);
    return res;
  } catch (error) {
    throw error;
  }
};
