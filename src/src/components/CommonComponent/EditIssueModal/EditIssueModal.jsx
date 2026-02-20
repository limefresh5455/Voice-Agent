import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";

import { RxCross2 } from "react-icons/rx";
import { FiPlus } from "react-icons/fi";
const EditIssueModal = ({
  show,
  loading,
  data,
  onClose,
  onSave,
  isBulkEditing,
}) => {
  const [saving, setSaving] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [formData, setFormData] = useState({
    Issue: "",
    resolution_steps: [],
  });
  const [steps, setSteps] = useState([""]);
  const [paragraphSteps, setParagraphSteps] = useState("");
  const [stepMode, setStepMode] = useState("step");

  useEffect(() => {
    if (data) {
      setFormData({
        Issue: data.Issue || "",
        Category: data.Category || "",
        Priority: data.Priority || "",
        Router_Call: data.Router_Call || "",
        Suggestion_Time: data.Suggestion_Time || "",
        resolution_steps: data.Resolution_Steps
          ? data.Resolution_Steps.split(". ")
              .filter(Boolean)
              .map((step, index) => ({
                step_number: index + 1,
                description: step,
              }))
          : [{ step_number: 1, description: "" }],
      });

      setParagraphSteps(data.Resolution_Steps || "");
    }
  }, [data]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleStepChange = (index, value) => {
    const updatedSteps = [...formData.resolution_steps];
    updatedSteps[index].description = value;

    setFormData((prev) => ({
      ...prev,
      resolution_steps: updatedSteps,
    }));

    const paragraph = updatedSteps
      .map((s) => s.description)
      .filter((text) => text.trim() !== "")
      .join("\n");

    setParagraphSteps(paragraph);
  };

  const handleAddStep = () => {
    const updatedSteps = [
      ...formData.resolution_steps,
      {
        step_number: formData.resolution_steps.length + 1,
        description: "",
      },
    ];
    setFormData((prev) => ({
      ...prev,
      resolution_steps: updatedSteps,
    }));

    setParagraphSteps(updatedSteps.map((s) => s.description).join("\n"));
  };

  const handleRemoveStep = (index) => {
    const updatedSteps = formData.resolution_steps
      .filter((_, i) => i !== index)
      .map((step, i) => ({
        ...step,
        step_number: i + 1,
      }));

    setFormData((prev) => ({
      ...prev,
      resolution_steps: updatedSteps,
    }));
    setParagraphSteps(updatedSteps.map((s) => s.description).join("\n"));
  };

  const handleSave = async () => {
    if (!data?.row_id) {
      toast.error("Invalid issue ID!");
      return;
    }

    let finalSteps = [];

    if (stepMode === "step") {
      if (formData.resolution_steps.some((s) => !s.description.trim())) {
        toast.error("Please fill all steps");
        return;
      }

      finalSteps = formData.resolution_steps.map((s) => s.description);
    } else {
      if (!paragraphSteps.trim()) {
        toast.error("Please enter paragraph steps");
        return;
      }

      finalSteps = [paragraphSteps.trim()];
    }

    const payload = {
      row_id: data.row_id,
      issue_name: formData.Issue,
      steps: finalSteps,
    };

    try {
      setSaving(true);
      await onSave(payload);
    } catch (error) {
      toast.error("Failed to update issue!");
    } finally {
      setSaving(false);
    }
  };

  const convertParagraphToSteps = (text) => {
    const lines = text
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    return lines.map((line, index) => ({
      step_number: index + 1,
      description: line,
    }));
  };
  useEffect(() => {
    if (stepMode === "step") {
      const formattedSteps = convertParagraphToSteps(paragraphSteps);

      if (formattedSteps.length > 0) {
        setFormData((prev) => ({
          ...prev,
          resolution_steps: formattedSteps,
        }));
      }
    }
  }, [stepMode]);

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
              {[{ label: "Issue Name", name: "Issue" }].map((field) => (
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
                <div style={{ marginBottom: "15px" }}>
                  <h5 className="step_heading">Resolution Steps:</h5>
                  <label style={{ marginRight: "15px" }}>
                    <input
                      type="radio"
                      checked={stepMode === "step"}
                      onChange={() => setStepMode("step")}
                    />{" "}
                    Step Wise
                  </label>

                  <label>
                    <input
                      type="radio"
                      checked={stepMode === "paragraph"}
                      onChange={() => setStepMode("paragraph")}
                    />{" "}
                    Paragraph
                  </label>
                </div>

                {stepMode === "step" && (
                  <button onClick={handleAddStep} className="add_steps">
                    <FiPlus style={{ marginRight: "8px" }} />
                    Add Step
                  </button>
                )}
              </div>
              {stepMode === "step" ? (
                Array.isArray(formData.resolution_steps) &&
                formData.resolution_steps.map((step, index) => (
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
                ))
              ) : (
                <textarea
                  className="form-control"
                  rows="5"
                  placeholder="Enter resolution steps in paragraph format..."
                  value={paragraphSteps}
                  onChange={(e) => {
                    const value = e.target.value;
                    setParagraphSteps(value);

                    const formattedSteps = convertParagraphToSteps(value);

                    setFormData((prev) => ({
                      ...prev,
                      resolution_steps:
                        formattedSteps.length > 0
                          ? formattedSteps
                          : [{ step_number: 1, description: "" }],
                    }));
                  }}
                />
              )}
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
                {saving
                  ? "Updating..."
                  : selectedIds?.length > 0 && isBulkEditing
                    ? "Update & Next"
                    : "Update"}
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
