import "./ConfirmDeleteModal.css";

const ConfirmDeleteModal = ({
  show,
  message,
  onConfirm,
  onCancel,
  isDeleting,
}) => {
  if (!show) return null;

  return (
    <div className="deleteModalOverlay">
      <div className="deleteModalBox">
        <h3 className="deleteModalTitle">Confirm Delete</h3>
        <p className="deleteModalText">{message}</p>

        <div className="deleteModalActions">
          <button
            className="btn btn-danger"
            onClick={onConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </button>

          <button
            className="cancelBtn"
            onClick={onCancel}
            disabled={isDeleting}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDeleteModal;
