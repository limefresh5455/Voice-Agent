import React from "react";
import "./ConfirmDeleteModal.css";

const ConfirmDeleteModal = ({ show, message, onConfirm, onCancel }) => {
  if (!show) return null;

  return (
    <div className="deleteModalOverlay">
      <div className="deleteModalBox">
        <h3 className="deleteModalTitle">Confirm Delete</h3>
        <p className="deleteModalText">{message}</p>
        <div className="deleteModalActions">
          <button className="deleteBtn" onClick={onConfirm}>
            Delete
          </button>
          <button className="cancelBtn" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDeleteModal;
