import React, { useState, useEffect } from "react";
import { FiPlus } from "react-icons/fi";
import { RxCross2 } from "react-icons/rx";
import {
  CreateIssue,
  GetIssues,
  GetIssuesForCategory,
} from "../UserServices/UserServices";
import { toast } from "react-toastify";

const AddIssueModal = ({ show, onClose, organization, onIssueAdded }) => {
  const [categoryId, setCategoryId] = useState("");
  const [categories, setCategories] = useState([]);
  const [issueId, setIssueId] = useState("");
  const [issues, setIssues] = useState([]);
  const [newIssue, setNewIssue] = useState("");
  const [resolutionSteps, setResolutionSteps] = useState([{ id: 1, text: "" }]);
  const [loading, setLoading] = useState(false);
  const [stepMode, setStepMode] = useState("step");
  const [paragraphSteps, setParagraphSteps] = useState("");
  const [categoryForm, setCategoryForm] = useState({
    name: "",
    routing_channel: "",
    suggested_sla: "",
    priority: "",
  });
  const [newCategory, setNewCategory] = useState({
    name: "",
    routing_channel: "",
    suggested_sla: "",
    priority: "",
  });

  useEffect(() => {
    if (show && organization != null) {
      GetIssues(Number(organization))
        .then((res) => {
          const apiData = res?.data?.data || [];

          const uniqueCategories = [];
          const categoryMap = new Map();

          apiData.forEach((item) => {
            if (!categoryMap.has(item.category_id)) {
              categoryMap.set(item.category_id, true);
              uniqueCategories.push({
                id: item.category_id,
                name: item.category_name,
                routing_channel: item.routing_channel,
                suggested_sla: item.suggested_sla,
                priority: item.priority,
              });
            }
          });

          setCategories(uniqueCategories);
        })
        .catch((err) => console.error("Failed to fetch categories:", err));
    }
  }, [show, organization]);

  useEffect(() => {
    const fetchIssues = async () => {
      if (categoryId) {
        try {
          const data = await GetIssuesForCategory(categoryId);
          console.log("dafdfdfdf", data);
          setIssues(Array.isArray(data?.issues) ? data.issues : []);
          setIssueId("");
        } catch (err) {
          console.error("Failed to fetch issues for category:", err);
          setIssues([]);
        }
      } else {
        setIssues([]);
      }
    };

    fetchIssues();
  }, [categoryId]);

  if (!show) return null;

  const handleStepChange = (id, value) => {
    const updatedSteps = resolutionSteps.map((step) =>
      step.id === id ? { ...step, text: value } : step,
    );
    setResolutionSteps(updatedSteps);
    const paragraph = updatedSteps
      .map((step) => step.text)
      .filter((text) => text.trim() !== "")
      .join("\n");
    setParagraphSteps(paragraph);
  };

  const addStep = () => {
    const updated = [
      ...resolutionSteps,
      { id: resolutionSteps.length + 1, text: "" },
    ];

    setResolutionSteps(updated);

    const paragraph = updated.map((s) => s.text).join("\n");
    setParagraphSteps(paragraph);
  };

  const removeStep = (id) => {
    const updated = resolutionSteps
      .filter((step) => step.id !== id)
      .map((step, index) => ({ ...step, id: index + 1 }));

    setResolutionSteps(updated);

    const paragraph = updated.map((s) => s.text).join("\n");
    setParagraphSteps(paragraph);
  };

  const handleSubmit = async () => {
    if (!categoryId && !newCategory.name) {
      toast.error("Category is required");
      return;
    }

    if (!issueId && !newIssue.trim()) {
      toast.error("Please select or enter issue name");
      return;
    }

    let finalSteps = [];

    if (stepMode === "step") {
      if (resolutionSteps.some((s) => !s.text.trim())) {
        toast.error("Please fill all resolution steps");
        return;
      }
      finalSteps = resolutionSteps.map((s) => s.text);
    } else {
      if (!paragraphSteps.trim()) {
        toast.error("Please enter resolution steps");
        return;
      }
      finalSteps = [paragraphSteps.trim()];
    }

    let categoryPayload = null;

    if (newCategory.name) {
      if (
        !newCategory.routing_channel ||
        !newCategory.suggested_sla ||
        !newCategory.priority
      ) {
        toast.error("Please fill all new category details");
        return;
      }

      categoryPayload = {
        name: newCategory.name,
        routing_channel: newCategory.routing_channel,
        suggested_sla: newCategory.suggested_sla,
        priority: newCategory.priority,
      };
    } else if (categoryId) {
      const selectedCategory = categories.find(
        (cat) => cat.id === Number(categoryId),
      );

      categoryPayload = {
        name: selectedCategory?.name || "",
        routing_channel: selectedCategory?.routing_channel || "",
        suggested_sla: selectedCategory?.suggested_sla || "",
        priority: selectedCategory?.priority || "",
      };
    }

    const payload = {
      category_id: categoryId || null,
      new_category: categoryPayload,
      issue_id: issueId || null,
      issue_name:
        newIssue.trim() ||
        issues.find((i) => i.issue_id.toString() === issueId)?.issue_name ||
        "",
      steps: finalSteps,
    };

    console.log("Payload:", payload);

    try {
      setLoading(true);
      const res = await CreateIssue(payload);
      if (res?.data) {
        toast.success("Issue created successfully");
        onIssueAdded();
      }
      onClose();
    } catch (error) {
      toast.error("Failed to create issue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        background: "rgba(0,0,0,0.35)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
      }}
    >
      <div
        style={{
          width: "560px",
          maxWidth: "95%",
          background: "#fff",
          borderRadius: "14px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
          maxHeight: "85vh",
          overflowY: "auto",
        }}
      >
        <div
          style={{
            padding: "16px 20px",
            borderBottom: "1px solid #eee",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h5 style={{ margin: 0, fontWeight: 600 }}>Add Issue</h5>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              fontSize: "22px",
              cursor: "pointer",
            }}
          >
            ×
          </button>
        </div>
        {loading && (
          <div className="text-center mt-2">
            <span className="spinner-border spinner-border-sm"></span>
            <span style={{ marginLeft: "8px" }}>Please wait...</span>
          </div>
        )}
        <div style={{ padding: "18px 20px" }}>
          <label className="form-label">Category</label>
          <select
            className="form-control"
            value={categoryId}
            disabled={newCategory.name.length > 0}
            onChange={(e) => setCategoryId(e.target.value)}
          >
            <option value="">Select Category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>

          <div style={{ textAlign: "center", margin: "10px 0" }}>OR</div>
          <label className="form-label mt-2">Category Name</label>
          <input
            type="text"
            className="form-control"
            placeholder="Enter category name"
            value={newCategory.name}
            disabled={categoryId.length > 0}
            onChange={(e) =>
              setNewCategory({ ...newCategory, name: e.target.value })
            }
          />
          {(newCategory.name || categoryId) && (
            <>
              <label className="form-label mt-3">Routing Channel</label>
              <input
                type="text"
                className="form-control"
                placeholder="Enter routing channel"
                value={newCategory.routing_channel}
                onChange={(e) =>
                  setNewCategory({
                    ...newCategory,
                    routing_channel: e.target.value,
                  })
                }
              />

              <label className="form-label mt-2">Suggested SLA</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. 24 hours"
                value={newCategory.suggested_sla}
                onChange={(e) =>
                  setNewCategory({
                    ...newCategory,
                    suggested_sla: e.target.value,
                  })
                }
              />

              <label className="form-label mt-2">Priority</label>
              <select
                className="form-control"
                value={newCategory.priority}
                onChange={(e) =>
                  setNewCategory({ ...newCategory, priority: e.target.value })
                }
              >
                <option value="">Select Priority</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </>
          )}

          <label className="form-label">Issue</label>
          <select
            className="form-control"
            value={issueId}
            disabled={!categoryId || newIssue.length > 0}
            onChange={(e) => setIssueId(e.target.value)}
          >
            <option value="">Select Issue</option>
            {issues.map((issue) => (
              <option key={issue.issue_id} value={issue.issue_id}>
                {issue.issue_name}
              </option>
            ))}
          </select>

          <div style={{ textAlign: "center", margin: "10px 0" }}>OR</div>

          <label className="form-label">Create New Issue</label>
          <input
            type="text"
            className="form-control"
            placeholder="Enter issue name"
            value={newIssue}
            disabled={issueId.length > 0}
            onChange={(e) => setNewIssue(e.target.value)}
          />
        </div>
        <div style={{ padding: "0 20px 10px" }}>
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

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "0 20px 8px",
          }}
        >
          <label className="form-label" style={{ marginBottom: 0 }}>
            Resolution Steps
          </label>
          <button onClick={addStep} className="add_steps">
            <FiPlus style={{ marginRight: "8px" }} /> Add Step
          </button>
        </div>

        {stepMode === "step" ? (
          resolutionSteps.map((step, index) => (
            <div
              key={step.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "0 20px",
                marginBottom: "10px",
              }}
            >
              <span
                style={{ minWidth: "65px", fontSize: "14px", fontWeight: 500 }}
              >
                Step {index + 1}:
              </span>
              <div className="resolution-step-container">
                <input
                  type="text"
                  className="resolution-step-input"
                  placeholder={`Step ${index + 1}`}
                  value={step.text}
                  onChange={(e) => handleStepChange(step.id, e.target.value)}
                />
                <button
                  onClick={() => removeStep(step.id)}
                  className="cross_icon"
                >
                  <RxCross2 />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div style={{ padding: "0 20px 15px" }}>
            <textarea
              className="form-control"
              rows="5"
              placeholder="Enter resolution steps in paragraph format..."
              value={paragraphSteps}
              onChange={(e) => {
                const value = e.target.value;
                setParagraphSteps(value);

                const lines = value
                  .split("\n")
                  .map((line) => line.trim())
                  .filter((line) => line.length > 0);

                const formattedSteps = lines.map((line, index) => ({
                  id: index + 1,
                  text: line,
                }));

                setResolutionSteps(
                  formattedSteps.length
                    ? formattedSteps
                    : [{ id: 1, text: "" }],
                );
              }}
            />
          </div>
        )}

        <div
          style={{
            padding: "16px 20px",
            borderTop: "1px solid #eee",
            display: "flex",
            justifyContent: "flex-end",
            gap: "10px",
          }}
        >
          <button className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
          <button
            className="btn btn-primary submit-btn"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? "Submitting..." : "Submit"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddIssueModal;
