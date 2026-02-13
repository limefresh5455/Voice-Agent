import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { NotVerifiedEscalation } from "./UserServices/UserServices";

const NonVerifiedLeadsForm = ({ orgId, onClose, onSuccess }) => {
  const [form, setForm] = useState({
    org_id: orgId,
    name: "",
    phone: "",
    email: "",
    query: "",
    title: "",
    description: "",
    priority: "",
  });

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  useEffect(() => {
    if (orgId) {
      setForm((prev) => ({
        ...prev,
        org_id: Number(orgId),
      }));
    }
  }, [orgId]);

  const handleSubmit = async () => {
    if (!form.org_id) {
      toast.error("Organization ID missing");
      return;
    }

    const requiredFields = [
      "name",
      "phone",
      "email",
      "query",
      "title",
      "description",
      "priority",
    ];

    for (let field of requiredFields) {
      if (!form[field]) {
        toast.warning("Please fill all required fields");
        return;
      }
    }

    try {
      await NotVerifiedEscalation(form);
      toast.success("Leads form submitted successfully");
      onSuccess?.();
      onClose();
    } catch (err) {
      toast.error("Failed to submit leads form");
    }
  };

  useEffect(() => {
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  return (
    <div className="not-verified-overlay">
      <div className="not-verified-modal">
        <div className="not-verified-header">
          Lead Form (Non-Verified User)
          <button
            className="not-verified-close-btn"
            onClick={onClose}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="not-verified-body">
          <input
            className="form-control mb-3"
            placeholder="Name"
            value={form.name}
            onChange={(e) => handleChange("name", e.target.value)}
          />

          <input
            className="form-control mb-3"
            placeholder="Email"
            value={form.email}
            onChange={(e) => handleChange("email", e.target.value)}
          />

          <input
            className="form-control mb-3"
            placeholder="Phone"
            value={form.phone}
            onChange={(e) => handleChange("phone", e.target.value)}
          />

          <textarea
            className="form-control mb-3"
            placeholder="Query"
            value={form.query}
            onChange={(e) => {
              handleChange("query", e.target.value);
              e.target.style.height = "auto";
              e.target.style.height = `${e.target.scrollHeight}px`;
            }}
            style={{ overflow: "hidden", resize: "none" }}
          />

          <input
            className="form-control mb-3"
            placeholder="Title"
            value={form.title}
            onChange={(e) => handleChange("title", e.target.value)}
          />

          <textarea
            className="form-control mb-3"
            rows={3}
            placeholder="Description"
            value={form.description}
            onChange={(e) => {
              handleChange("description", e.target.value);
              e.target.style.height = "auto";
              e.target.style.height = `${e.target.scrollHeight}px`;
            }}
            style={{ overflow: "hidden", resize: "none" }}
          />

          <select
            className="form-select mb-3"
            value={form.priority}
            onChange={(e) => handleChange("priority", e.target.value)}
          >
            <option value="">Select Priority</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>

        <div className="not-verified-footer">
          <button className="not-verified-btn" onClick={handleSubmit}>
            Submit Lead Form
          </button>
        </div>
      </div>
    </div>
  );
};

export default NonVerifiedLeadsForm;
