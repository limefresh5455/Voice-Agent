import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
  EditAdminDetails,
  UpdateAdminDetails,
} from "../UserServices/UserServices";

const EditCustomerModal = ({ show, customerId, onClose }) => {
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    location: "",
  });
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    if (show && customerId) {
      fetchCustomerDetails();
    }
  }, [show, customerId]);

  const fetchCustomerDetails = async () => {
    try {
      setLoading(true);
      const res = await EditAdminDetails(customerId);

      setFormData({
        first_name: res?.first_name || "",
        last_name: res?.last_name || "",
        email: res?.email || "",
        phone: res?.phone || "",
        location: `${res?.city || ""}${res?.country ? ", " + res.country : ""}`,
      });
    } catch (error) {
      toast.error("Failed to load customer details");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleUpdate = async () => {
    try {
      setLoading(true);

      const [city, country] = formData.location.split(",");

      await UpdateAdminDetails(customerId, {
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        phone: formData.phone,
        city: city?.trim() || "",
        country: country?.trim() || "",
      });

      toast.success("Customer updated successfully!");
      onClose();
    } catch (error) {
      toast.error("Update failed!");
    } finally {
      setLoading(false);
    }
  };

  if (!show) return null;
  return (
    <div className="editModalOverlay">
      <div className="editModalContainer">
        <div className="editModalHeader">
          <h5 className="edit_customer_head">Edit Customer</h5>
          <button className="closeBtn" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="editModalBody">
          {loading ? (
            <p>Loading...</p>
          ) : (
            <>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label>First Name</label>
                  <input
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                    className="form-control"
                  />
                </div>

                <div className="col-md-6 mb-3">
                  <label>Last Name</label>
                  <input
                    type="text"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                    className="form-control"
                  />
                </div>

                <div className="col-md-6 mb-3">
                  <label>Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="form-control"
                  />
                </div>

                <div className="col-md-6 mb-3">
                  <label>Phone</label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="form-control"
                  />
                </div>

                <div className="col-md-12 mb-3">
                  <label>Location</label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    className="form-control"
                    placeholder="City, Country"
                  />
                </div>
              </div>
            </>
          )}
        </div>
        <div className="editModalFooter ">
          <button
            className="btn btn-primary"
            onClick={handleUpdate}
            disabled={loading}
          >
            Update
          </button>
          <button className="btn btn-secondary me-2" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditCustomerModal;
