import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { ImportIssuesWithMapping } from "../UserServices/UserServices";

function CsvMappingModal({ show, onClose, fileData }) {
  const [mapping, setMapping] = useState({});
  const [loading, setLoading] = useState(false);
  const [headerRow, setHeaderRow] = useState(0);
  const csvHeaders = fileData?.csv_headers || [];
  const systemFields = fileData?.system_fields || [];
  const file = fileData?.file;

  useEffect(() => {
    if (csvHeaders.length > 0) {
      const initialMapping = {};

      csvHeaders.forEach((header) => {
        const normalizedHeader = header.replace(/\s/g, "").toLowerCase();

        const matchedField = systemFields.find(
          (field) => field.toLowerCase() === normalizedHeader,
        );

        initialMapping[header] = matchedField || "";
      });

      setMapping(initialMapping);
      setHeaderRow(fileData?.detected_header_row ?? 0);
    }
  }, [fileData]);

  if (!show) return null;

  const handleChange = (csvField, value) => {
    setMapping((prev) => ({
      ...prev,
      [csvField]: value,
    }));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      if (!file) {
        toast.error("File missing. Please upload again.");
        return;
      }

      const hasMapping = Object.values(mapping).some((val) => val !== "");
      if (!hasMapping) {
        toast.error("Please map at least one field");
        return;
      }

      const formData = new FormData();
      formData.append("file", file);
      formData.append("mapping", JSON.stringify(mapping));

      if (!isJsonFile) {
        formData.append("header_row", headerRow);
      }

      await ImportIssuesWithMapping(formData);

      toast.success("Issues imported successfully!");
      onClose();
    } catch (error) {
      console.error(error);
      toast.error("Import failed!");
    } finally {
      setLoading(false);
    }
  };

  const isJsonFile =
    file?.type === "application/json" ||
    file?.name?.toLowerCase().endsWith(".json");

  return (
    <div className="mapping-modal-overlay">
      <div className="mapping-modal-container">
        <h5 className="mb-3">
          {isJsonFile
            ? "Map JSON fields to system fields."
            : "Select the CSV fields to import and map them to system fields."}
        </h5>

        <div className="mapping-table-header">
          <div>CSV Field</div>
          <div></div>
          <div>System Field</div>
        </div>

        {csvHeaders.map((header, index) => (
          <div className="mapping-table-row" key={index}>
            <div className="csv-field">
              <strong>{header}</strong>
            </div>

            <div className="arrow">→</div>

            <div>
              <select
                className="form-select"
                value={mapping[header] || ""}
                onChange={(e) => handleChange(header, e.target.value)}
              >
                <option value="">Select Field</option>
                {systemFields.map((field, idx) => (
                  <option key={idx} value={field}>
                    {field}
                  </option>
                ))}
              </select>
            </div>
          </div>
        ))}

        <div className="mapping-actions mt-4">
          <button className="btn btn-light" onClick={onClose}>
            Back
          </button>

          <button
            className="btn btn-primary"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? "Importing..." : "Submit"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default CsvMappingModal;
