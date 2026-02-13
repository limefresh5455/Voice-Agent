import React from "react";
import { useTranslation } from "react-i18next";

const FormDetailsView = ({
  formDetail,
  loadingDetail,
  onClose,
  onResolve,
  isLoading,
  aiSummary,
}) => {
  const { t } = useTranslation();

  if (!formDetail) return null;

  return (
    <div className="form_details_wrapper">
      <div>
        <div
          style={{
            borderBottom: "1px solid #e3e3e3",
            paddingBottom: "10px",
            marginBottom: "20px",
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <h3 className="form_detail_title" style={{ margin: 0 }}>
            {t("formDetails")}
          </h3>

          <button
            onClick={onClose}
            style={{
              background: "#dc3545",
              padding: "6px 12px",
              borderRadius: "6px",
              color: "white",
              border: "none",
              cursor: "pointer",
            }}
          >
            {t("close")}
          </button>
        </div>

        {loadingDetail ? (
          <p>{t("loadingDetails")}</p>
        ) : (
          <div className="show-details">
            <div className="customer_form_details">
              <div className="box">
                <strong>{t("customerName")}</strong>
                <div>{formDetail.customer_name}</div>
              </div>

              <div className="box">
                <strong>{t("customerEmail")}</strong>
                <div>{formDetail.customer_email}</div>
              </div>

              <div className="box">
                <strong>{t("title")}</strong>
                <div>{formDetail.title}</div>
              </div>

              <div className="box">
                <strong>{t("priority")}</strong>
                <div>{formDetail.form_data?.priority}</div>
              </div>

              <div className="box">
                <strong>{t("serviceName")}</strong>
                <div>{formDetail.form_data?.service_name}</div>
              </div>

              <div className="box">
                <strong>{t("issueCategory")}</strong>
                <div>{formDetail.form_data?.issue_category}</div>
              </div>

              <div className="box">
                <strong>{t("createdAt")}</strong>
                <div>{new Date(formDetail.created_at).toLocaleString()}</div>
              </div>

              <div
                style={{
                  gridColumn: "1 / -1",
                  background: "#f7f7f7",
                  padding: "12px",
                  borderRadius: "8px",
                }}
              >
                <strong>{t("queryDescription")}</strong>
                <div style={{ marginTop: "5px" }}>
                  {formDetail.form_data?.Query_description}
                </div>
              </div>

              <div
                style={{
                  gridColumn: "1 / -1",
                  background: "#eef4ff",
                  padding: "12px",
                  borderLeft: "4px solid #2962ff",
                  borderRadius: "8px",
                }}
              >
                <strong>{t("aiAgentResponse")}</strong>
                <div style={{ marginTop: "5px" }}>
                  {formDetail.form_ai_agent_assistant_notes}
                </div>
              </div>

              <div
                style={{
                  gridColumn: "1 / -1",
                  padding: "12px",
                  background: "#fff3cd",
                  border: "1px solid #ffeeba",
                  borderRadius: "8px",
                  color: "#856404",
                  textAlign: "center",
                }}
              >
                {t("noteContactCustomer")}
              </div>

              <div
                style={{
                  gridColumn: "1 / -1",
                  textAlign: "center",
                  marginTop: "10px",
                }}
              >
                <button
                  onClick={() => onResolve(Number(formDetail.id))}
                  disabled={formDetail.form_status === "resolved"}
                  style={{
                    padding: "12px 20px",
                    background:
                      formDetail.form_status === "resolved"
                        ? "#6c757d"
                        : "#28a745",
                    border: "none",
                    color: "white",
                    borderRadius: "8px",
                    cursor:
                      formDetail.form_status === "resolved"
                        ? "not-allowed"
                        : "pointer",
                  }}
                >
                  {isLoading ? t("resolving") : t("resolveQuery")}
                </button>
              </div>
            </div>
            <div className="chatbot_summary">
              <div
                style={{
                  fontSize: "17px",
                  fontWeight: "600",
                  color: "#1f2937",
                  marginBottom: "12px",
                  borderBottom: "2px solid #f3f4f6",
                  paddingBottom: "8px",
                }}
              >
                {t("aiUserChatSummary")}
              </div>

              <div
                style={{
                  fontSize: "15px",
                  color: "#374151",
                  lineHeight: "1.7",
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                }}
              >
                {aiSummary ? aiSummary : t("noAiSummary")}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FormDetailsView;
