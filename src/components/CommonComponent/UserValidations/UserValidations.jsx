export const AdminFormValidation = (userDetails) => {
  let errors = {};

  const { company_name, email } = userDetails;

  if (!company_name) {
    errors.company_name = "*Company name is required";
  }
  if (!email) {
    errors.email = "*Email is required.";
  } else if (!/\S+@\S+\.\S+/.test(email)) {
    errors.email = "*Email is invalid.";
  }

  return errors;
};
