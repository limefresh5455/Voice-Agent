import React from "react";

function IssueDetailsModal({ show, loading, data, onClose }) {
  if (!show) return null;

  return (
    <>
      <div className="modal show d-block" tabIndex="-1">
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Issue Details</h5>
              <button
                type="button"
                className="btn-close"
                onClick={onClose}
              ></button>
            </div>

            <div className="modal-body">
              {loading ? (
                <p>Loading...</p>
              ) : data ? (
                <>
                  <p>
                    <strong>Category:</strong> {data.category_name}
                  </p>
                  <p>
                    <strong>Routing Channel:</strong> {data.routing_channel}
                  </p>
                  <p>
                    <strong>SLA:</strong> {data.suggested_sla}
                  </p>
                  <p>
                    <strong>Priority:</strong> {data.priority}
                  </p>

                  <p>
                    <strong>Issue Name:</strong> {data.issue?.issue_name}
                  </p>
                  {data.issue?.steps?.length > 0 && (
                    <>
                      <p>
                        <strong>Resolution Steps:</strong>
                      </p>

                      <ol className="steps_list">
                        {data.issue.steps.map((step) => (
                          <li key={step.step_number}>{step.description}</li>
                        ))}
                      </ol>
                    </>
                  )}
                </>
              ) : (
                <p>No details found</p>
              )}
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={onClose}>
                Close
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="modal-backdrop fade show" onClick={onClose}></div>
    </>
  );
}

export default IssueDetailsModal;
