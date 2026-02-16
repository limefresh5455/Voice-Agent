import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { ImportIssuesWithMapping } from "../UserServices/UserServices";

function CsvMappingModal({
  show,
  onClose,
  fileData,
  currentIndex,
  totalFiles,
  onNext,
}) {
  const [mapping, setMapping] = useState({});
  const [loading, setLoading] = useState(false);
  const [headerRow, setHeaderRow] = useState(0);
  const preview = fileData?.preview || {};
  const [allMappings, setAllMappings] = useState([]);

  const systemFields = preview.system_fields || [];
  const headers = preview.json_headers || preview.csv_headers || [];

  const file = fileData?.file;

  const isJsonFile =
    file?.type === "application/json" ||
    file?.name?.toLowerCase().endsWith(".json");

  useEffect(() => {
    if (headers.length > 0) {
      const initialMapping = {};

      headers.forEach((header) => {
        const normalizedHeader = header.replace(/\s/g, "").toLowerCase();

        const matchedField = systemFields.find(
          (field) => field.toLowerCase() === normalizedHeader,
        );

        initialMapping[header] = matchedField || "";
      });

      setMapping(initialMapping);
      setHeaderRow(preview?.detected_header_row ?? 0);
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
      if (!file) {
        toast.error("File missing. Please upload again.");
        return;
      }

      const hasMapping = Object.values(mapping).some((val) => val !== "");
      if (!hasMapping) {
        toast.error("Please map at least one field");
        return;
      }

      onNext({
        file,
        mapping,
        headerRow,
      });
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong!");
    }
  };

  return (
    <div className="mapping-modal-overlay">
      <div className="mapping-modal-container">
        <h5 className="mb-3">
          {isJsonFile
            ? "Map JSON fields to system fields."
            : "Select the CSV fields to import and map them to system fields."}
        </h5>

        <div className="mapping-table-header">
          <div>{isJsonFile ? "JSON Field" : "CSV Field"}</div>

          <div></div>
          <div>System Field</div>
        </div>

        {headers.map((header, index) => (
          <div className="mapping-table-row" key={index}>
            <div className="csv-field">
              <strong>{header}</strong>
            </div>

            <div className="mapping-arrow">→</div>

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
            {currentIndex === totalFiles - 1 ? "Submit" : "Next"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default CsvMappingModal;
