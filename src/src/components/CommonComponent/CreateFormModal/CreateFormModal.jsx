import React, { useEffect, useState } from "react";

const CreateFormModal = ({
  title,
  Save,
  show,
  onClose,
  handleSave,
  organization_name,
  setOrganizationName,
  name,
  setName,
  email,
  setEmail,
  phone_no,
  setPhoneNo,
  location,
  setLocation,
  website,
  setWebsite,
  description,
  setDescription,
  isEditMode,
  role,
  bulkEditIds = [],
  bulkEditIndex = 0,
}) => {
  useEffect(() => {
    if (show) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [show]);
  const [phoneError, setPhoneError] = useState("");
  const handlePhoneChange = (e) => {
    const value = e.target.value;
    setPhoneNo(value);

    if (value && !/^\d+$/.test(value)) {
      setPhoneError("Please enter number");
    } else {
      setPhoneError("");
    }
  };

  if (!show) return null;
  return (
    <div>
      <div className="modal fade show" style={{ display: "block" }}>
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">{title}</h5>
              <button
                type="button"
                className="btn-close"
                onClick={onClose}
              ></button>
            </div>
            <div className="modal-body">
              <form className="modal_form">
                {role === "superadmin" && (
                  <div className="mb-3">
                    <label className="form-label">Organization Name</label>
                    <input
                      type="text"
                      className="form-control"
                      value={organization_name}
                      onChange={(e) => setOrganizationName(e.target.value)}
                    />
                  </div>
                )}
                {role === "user" && (
                  <div className="mb-3">
                    <label className="form-label">Name</label>
                    <input
                      type="text"
                      className="form-control"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                )}
                <div className="mb-3">
                  <label className="form-label">Email Id</label>
                  <input
                    type="email"
                    className="form-control"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isEditMode}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Phone Number</label>
                  <input
                    type="text"
                    className={`form-control ${phoneError ? "gray-highlight" : ""}`}
                    value={phone_no}
                    onChange={handlePhoneChange}
                  />
                  {phoneError && (
                    <small className="text-muted">Please enter number</small>
                  )}
                </div>

                {role === "superadmin" && (
                  <div className="mb-3">
                    <label className="form-label">Location</label>
                    <input
                      type="text"
                      className="form-control"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                    />
                  </div>
                )}
                {role === "superadmin" && (
                  <div className="mb-3">
                    <label className="form-label">Website</label>
                    <input
                      type="text"
                      className="form-control"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                    />
                  </div>
                )}
                <div className="mb-3">
                  <label className="form-label">Description</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  ></textarea>
                </div>
              </form>
            </div>

            <div className="modal-footer d-flex justify-content-between">
              {bulkEditIds.length > 0 &&
                bulkEditIndex < bulkEditIds.length - 1 && (
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={handleSave}
                  >
                    Update & Next
                  </button>
                )}
              <button type="button" className="add_btn01" onClick={handleSave}>
                {Save}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateFormModal;
