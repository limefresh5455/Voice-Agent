import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { UpdateIssues } from "../UserServices/UserServices";
import { RxCross2 } from "react-icons/rx";
import { FiPlus } from "react-icons/fi";
const EditIssueModal = ({ show, loading, data, onClose, onSave }) => {
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    issue_name: "",
    resolution_steps: [],
  });
  useEffect(() => {
    if (data) {
      setFormData({
        issue_name: data.issue?.issue_name || "",
        resolution_steps: data.issue?.steps || [],
      });
    }
  }, [data]);
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  const handleStepChange = (index, value) => {
    const steps = [...formData.resolution_steps];
    steps[index].description = value;
    setFormData((prev) => ({ ...prev, resolution_steps: steps }));
  };
  const handleAddStep = () => {
    setFormData((prev) => ({
      ...prev,
      resolution_steps: [
        ...prev.resolution_steps,
        { step_number: prev.resolution_steps.length + 1, description: "" },
      ],
    }));
  };
  const handleRemoveStep = (index) => {
    const steps = formData.resolution_steps.filter((_, i) => i !== index);
    steps.forEach((step, i) => (step.step_number = i + 1));
    setFormData((prev) => ({ ...prev, resolution_steps: steps }));
  };
  const handleSave = async () => {
    if (!data?.issue?.issue_id) {
      toast.error("Invalid issue ID!");
      return;
    }
    const payload = {
      issue_name: formData.issue_name,
      steps: formData.resolution_steps
        .slice(0, 100)
        .map((step) => step.description),
    };
    try {
      setSaving(true);
      await UpdateIssues(data.issue.issue_id, payload);
      toast.success("Issue updated successfully!");
      onClose();
    } catch (error) {
      console.error("Update failed:", error);
      toast.error("Failed to update issue!");
    } finally {
      setSaving(false);
    }
  };
  if (!show) return null;
  return (
    <div
      className="modal-backdrop"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        background: "rgba(0,0,0,0.3)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
      }}
    >
      <div
        className="modal-content"
        style={{
          width: "700px",
          background: "#f9f9f9",
          padding: "25px 30px",
          borderRadius: "12px",
          boxShadow: "0 6px 20px rgba(0,0,0,0.15)",
          maxHeight: "80vh",
          overflowY: "auto",
        }}
      >
        <h3 className="heading_edit">Edit Issue</h3>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: " 1fr",
                gap: "15px",
                marginBottom: "20px",
              }}
              className="mt-3"
            >
              {[{ label: "Issue Name", name: "issue_name" }].map((field) => (
                <div key={field.name}>
                  <label className="fw-bold ">{field.label}:</label>
                  <input
                    type="text"
                    name={field.name}
                    value={formData[field.name]}
                    onChange={handleChange}
                    className="edit_input"
                  />
                </div>
              ))}
            </div>
            <div className="mb-3">
              <div className="d-flex align-items-baseline justify-content-between mb-3">
                <h5 className="step_heading">Resolution Steps:</h5>
                <button onClick={handleAddStep} className="add_steps">
                  <FiPlus style={{ marginRight: "8px" }} />
                  Add Step
                </button>
              </div>
              {formData.resolution_steps.map((step, index) => (
                <div
                  key={index}
                  className="d-flex justify-space-between gap-3 mb-3 align-items-center"
                >
                  <span className="steps">Step {step.step_number}:</span>
                  <input
                    type="text"
                    value={step.description}
                    onChange={(e) => handleStepChange(index, e.target.value)}
                    className="steps_inner_box"
                  />
                  <button
                    onClick={() => handleRemoveStep(index)}
                    className="cross_icon"
                  >
                    <RxCross2 />
                  </button>
                </div>
              ))}
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "10px",
              }}
            >
              <button
                onClick={handleSave}
                disabled={saving}
                className="btn btn-primary"
              >
                {saving ? "Updating..." : "Update"}
              </button>
              <button onClick={onClose} className="btn btn-secondary">
                Cancel
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default EditIssueModal;
