import React from "react";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { ResolveLeadQuery } from "../AdminServices/AdminServices";
import { useState } from "react";

const LeadDetailModal = ({ show, data, onClose, onResolve, resolvingIds }) => {
  if (!show || !data) return null;
  const { t } = useTranslation();

  return (
    <div style={{ padding: "20px" }}>
      <div className="lead-modal">
        <div className="lead-modal-header">
          <h3>{t("formDetailsTitle")}</h3>
          <button className="lead-close-btn" onClick={onClose}>
            {t("close")}
          </button>
        </div>

        <div className="modal-body details-layout">
          <div className="detail-grid">
            <div>
              <label>{t("customerName")}</label>
              <p>{data.name || "-"}</p>
            </div>

            <div>
              <label>{t("customerEmail")}</label>
              <p>{data.email || "-"}</p>
            </div>

            <div>
              <label>{t("customerPhone")}</label>

              <p>{data.phone || "-"}</p>
            </div>

            <div>
              <label>{t("title")}</label>
              <p>{data.title || "-"}</p>
            </div>

            <div>
              <label>{t("priority")}</label>
              <p>{data.priority || "-"}</p>
            </div>

            <div>
              <label>{t("serviceName")}</label>
              <p>{data.service_name || "-"}</p>
            </div>

            <div>
              <label>{t("createdAt")}</label>
              <p>{new Date(data.created_at).toLocaleString()}</p>
            </div>
          </div>

          <div className="description-box">
            <h4>{t("queryDescription")}</h4>
            <p>{data.description || data.query || "-"}</p>
          </div>
          <div className="ai-response">
            <h4>{t("aiAgentResponse")}</h4>
            <p>{data.ai_reply || t("noAiResponseFound")}</p>
          </div>

          <div className="note-box">{t("noteContactCustomer")}</div>
          <div style={{ textAlign: "center", marginTop: "15px" }}>
            <button
              className="btn btn-success"
              disabled={
                data?.form_status === "resolved" ||
                resolvingIds.includes(data?.id)
              }
              onClick={() => onResolve(data.id)}
            >
              {resolvingIds.includes(data?.id)
                ? t("resolving")
                : data?.form_status === "resolved"
                ? t("resolved")
                : t("resolveQuery")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeadDetailModal;
