import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { EditAdminDetails, UpdateCustomer } from "../UserServices/UserServices";

const EditCustomerModal = ({
  show,
  customerId,
  onClose,
  bulkEditIds = [],
  bulkEditIndex = 0,
  setBulkEditIndex,
  bulkUpdateRef,
  setBulkEditIds,
}) => {
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    location: "",
  });
  const [loading, setLoading] = useState(false);
  const currentCustomerId =
    bulkEditIds.length > 0 ? bulkEditIds[bulkEditIndex] : customerId;

  useEffect(() => {
    if (show && currentCustomerId) {
      fetchCustomerDetails();
    }
  }, [show, currentCustomerId]);

  const fetchCustomerDetails = async () => {
    try {
      setLoading(true);
      const res = await EditAdminDetails(currentCustomerId);
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
      const updatedData = {
        customer_id: currentCustomerId,
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        phone: formData.phone,
        city: city?.trim() || "",
        country: country?.trim() || "",
      };
      if (bulkEditIds.length > 0) {
        bulkUpdateRef.current.push(updatedData);

        if (bulkEditIndex < bulkEditIds.length - 1) {
          setBulkEditIndex(bulkEditIndex + 1);
          setLoading(false);
          return;
        } else {
          await UpdateCustomer(bulkUpdateRef.current);
          toast.success("All customers updated successfully!");
          bulkUpdateRef.current = [];
          setBulkEditIds([]);
          onClose();
        }
      } else {
        await UpdateCustomer([updatedData]);
        toast.success("Customer updated successfully!");
        onClose();
      }
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
                    className="form-control"
                    disabled
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
        <div className="editModalFooter">
          {bulkEditIds.length > 0 ? (
            bulkEditIndex < bulkEditIds.length - 1 ? (
              <button
                className="btn btn-primary me-2"
                onClick={handleUpdate}
                disabled={loading}
              >
                Update & Next
              </button>
            ) : (
              <button
                className="btn btn-primary me-2"
                onClick={handleUpdate}
                disabled={loading}
              >
                Update
              </button>
            )
          ) : (
            <button
              className="btn btn-primary me-2"
              onClick={handleUpdate}
              disabled={loading}
            >
              Update
            </button>
          )}

          <button className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditCustomerModal;
