import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { FaExclamationTriangle } from "react-icons/fa";

const ConfirmModal = ({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  isDeleting,
}) => {
  const { t } = useTranslation(); // ✅ always call first
  // const [isDeleting, setIsDeleting] = useState(false); // optional: remove if parent manages this

  if (!isOpen) return null; // ✅ conditional return comes after hooks

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 9999,
        padding: "10px",
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: "12px",
          width: "100%",
          maxWidth: "450px",
          padding: "25px 20px",
          boxShadow: "0 8px 25px rgba(0,0,0,0.3)",
          textAlign: "center",
        }}
      >
        <div
          style={{ fontSize: "2.5rem", color: "#dc3545", marginBottom: "15px" }}
        >
          <FaExclamationTriangle />
        </div>

        <h2 style={{ margin: "0 0 10px 0", fontSize: "1.5rem", color: "#333" }}>
          {title || t("deleteConfirmationTitle")}
        </h2>

        <p style={{ color: "#555", fontSize: "1rem", marginBottom: "25px" }}>
          {message || t("deleteConfirmationMessage")}
        </p>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: "10px",
          }}
        >
          <button
            onClick={onCancel}
            style={{
              flex: 1,
              padding: "10px 0",
              borderRadius: "8px",
              border: "1px solid #ccc",
              background: "#f8f9fa",
              color: "#333",
              fontWeight: "500",
              cursor: "pointer",
            }}
          >
            {t("cancel")}
          </button>

          <button
            onClick={onConfirm}
            disabled={isDeleting}
            style={{
              flex: 1,
              padding: "10px 0",
              borderRadius: "8px",
              border: "none",
              background: isDeleting ? "#e74c3c80" : "#dc3545",
              color: "white",
              fontWeight: "600",
              cursor: isDeleting ? "not-allowed" : "pointer",
            }}
          >
            {isDeleting ? t("deleting") : t("delete")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
