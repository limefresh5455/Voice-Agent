import React from "react";
import { useTranslation } from "react-i18next";
import { FaExclamationTriangle } from "react-icons/fa";

const ConfirmModal = ({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  isLoading,
}) => {
  if (!isOpen) return null;
  const { t } = useTranslation();
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
          animation: "fadeIn 0.3s ease",
        }}
      >
        <div
          style={{
            fontSize: "2.5rem",
            color: "#dc3545",
            marginBottom: "15px",
          }}
        >
          <FaExclamationTriangle />
        </div>

        <h2 style={{ margin: "0 0 10px 0", fontSize: "1.5rem", color: "#333" }}>
          {title || "Delete Confirmation"}
        </h2>

        <p style={{ color: "#555", fontSize: "1rem", marginBottom: "25px" }}>
          {message ||
            "Are you sure you want to delete this item? This action cannot be undone."}
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
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => (e.target.style.background = "#e2e6ea")}
            onMouseLeave={(e) => (e.target.style.background = "#f8f9fa")}
          >
            {t("cancel")}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            style={{
              flex: 1,
              padding: "10px 0",
              borderRadius: "8px",
              border: "none",
              background: isLoading ? "#e74c3c80" : "#dc3545",
              color: "white",
              fontWeight: "600",
              cursor: isLoading ? "not-allowed" : "pointer",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) =>
              !isLoading && (e.target.style.background = "#c0392b")
            }
            onMouseLeave={(e) =>
              !isLoading && (e.target.style.background = "#dc3545")
            }
          >
            {isLoading ? t("deleting") : t("yesDelete")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
