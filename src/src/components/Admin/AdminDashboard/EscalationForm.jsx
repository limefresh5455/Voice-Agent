import React from "react";
import { useTranslation } from "react-i18next";

export const EscalationForm = ({ customerData }) => {
  const { t } = useTranslation();
  return (
    <div className="customer_detail">
      <h3 className="rp-title">{t("customerDetails")}</h3>

      <div className="rp-card">
        <div>
          <p>
            {" "}
            <strong>{t("name")}:</strong>
            <span>{customerData?.name || "N/A"}</span>
          </p>
        </div>
        <div>
          <p>
            {" "}
            <strong>{t("email")}</strong>
            <span>{customerData?.email || "N/A"}</span>
          </p>
        </div>
        <div>
          <p>
            <strong>{t("phone")}</strong>
            <span> {customerData?.phone || "N/A"}</span>
          </p>
        </div>
        <div>
          <p>
            {" "}
            <strong>{t("address")}</strong>
            <span> {customerData?.address || "N/A"}</span>
          </p>
        </div>

        <div>
          <p>
            <strong>{t("city")}</strong>
            <span> {customerData?.city || "N/A"}</span>
          </p>
        </div>

        <div>
          <p>
            <strong>{t("country")}</strong>
            <span> {customerData?.country || "N/A"}</span>
          </p>
        </div>

        <div>
          <p>
            {" "}
            <strong>{t("status")}</strong>
            <span> {customerData?.status || "N/A"}</span>
          </p>
        </div>

        <div>
          <p>
            <strong>{t("createdAt")}</strong>{" "}
            <span>
              {" "}
              {customerData?.created_at
                ? new Date(customerData.created_at).toLocaleString()
                : "N/A"}
            </span>
          </p>
        </div>
      </div>

      <h3 className="rp-title">{t("activeServices")}</h3>
      <div className="rp-history">
        {customerData?.services?.length > 0 ? (
          customerData.services.map((s, i) => (
            <div key={i} className="rp-history-item">
              <p>
                <strong>{t("serviceName")}</strong>
                <span>{s.service_name}</span>
              </p>
              <p>
                <strong>{t("billingCycle")}</strong>
                <span>{s.billing_cycle}</span>
              </p>
              <p>
                <strong>{t("price")}</strong>
                <span>{s.price}</span>
              </p>
            </div>
          ))
        ) : (
          <p className="no-history">{t("noServicesFound")}</p>
        )}
      </div>

      <h3 className="rp-title">{t("restrictions")}</h3>
      {customerData?.restrictions?.length > 0 ? (
        customerData.restrictions.map((r, i) => (
          <div key={i} className="rp-transaction-card">
            <p>
              <strong>{t("type")}</strong> {r.type}
            </p>
            <p>
              <strong>{t("description")}</strong> {r.description}
            </p>
            <p>
              <strong>{t("active")}</strong> {r.isActive ? t("yes") : t("no")}
            </p>
          </div>
        ))
      ) : (
        <p className="no-history"> {t("noRestrictions")}</p>
      )}
      <h3 className="rp-title">{t("transactions")}</h3>
      <div className="rp-transactions">
        {customerData?.transactions?.length > 0 ? (
          customerData.transactions.map((txn, i) => (
            <div key={i} className="rp-transaction-card">
              <p>
                <strong>{t("date")}</strong>{" "}
                {new Date(txn.date).toLocaleDateString()}
              </p>
              <p>
                <strong>{t("type")}</strong> {txn.type}
              </p>
              <p>
                <strong>{t("amount")}</strong> {txn.currency} {txn.amount}
              </p>
              <p>
                <strong>{t("status")}</strong> {txn.status}
              </p>
              {txn.notes && (
                <p>
                  <strong>{t("notes")}</strong> {txn.notes}
                </p>
              )}
              <p>
                <strong>{t("transactionId")}</strong> {txn.transactionId}
              </p>
            </div>
          ))
        ) : (
          <p className="no-history">{t("noTransactionsFound")}</p>
        )}
      </div>
    </div>
  );
};
