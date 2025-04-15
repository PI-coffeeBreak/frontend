import { useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { FiUpload } from "react-icons/fi";
import { FaFile, FaTrash, FaDownload, FaSpinner } from "react-icons/fa";
import * as XLSX from 'xlsx';
import { useNotification } from "../../contexts/NotificationContext";
import { useForm } from "../../hooks/useForm";
import { generateRandomPassword } from "../../utils/passwordUtils";

// Constants
const MAX_FILE_SIZE = 1024 * 1024; // 1MB
const ALLOWED_FILE_TYPE = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

// Helper function to validate email
const isValidEmail = (email) => {
  if (!email) return false;
  return email.includes('@') && email.includes('.');
};

// Main Excel parsing function
const parseExcel = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        // Process the workbook and get raw data
        const workbook = XLSX.read(new Uint8Array(e.target.result), { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        if (!firstSheetName) {
          throw new Error("Excel file contains no sheets");
        }
        const worksheet = workbook.Sheets[firstSheetName];
        const allRows = XLSX.utils.sheet_to_json(worksheet, {
          raw: false,
          defval: ""
        });

        // Filter out rows with invalid emails
        const validData = allRows
          .filter(row => isValidEmail(row.email || ''))
          .map(row => ({
            firstName: row.firstName || row["first name"] || "",
            lastName: row.lastName || row["last name"] || "",
            email: row.email || "",
            role: row.role || "Participant",
            temporaryPassword: row.password || row.temporaryPassword || generateRandomPassword(),
          }));

        // Count invalid emails
        const invalidCount = allRows.length - validData.length;

        console.log("Parsed Excel data:", validData);
        resolve({
          validData,
          stats: {
            total: allRows.length,
            valid: validData.length,
            invalid: invalidCount
          }
        });
      } catch (error) {
        console.error("Error parsing Excel:", error);
        reject(new Error("Failed to parse Excel file. Please ensure it's a valid Excel format."));
      }
    };

    reader.onerror = (error) => reject(error);

    // Use modern ArrayBuffer reading method
    reader.readAsArrayBuffer(file);
  });
};

/**
 * Modal for importing users from Excel file
 */
export function UserExcelImport({ isOpen, onClose, onImport }) {
  // Use the form hook for state management
  const {
    values,
    errors,
    setErrors,
    handleFileChange,
    resetForm
  } = useForm({
    file: null
  });

  const [uploadProgress, setUploadProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isTemplateLoading, setIsTemplateLoading] = useState(false);
  const [userData, setUserData] = useState([]);
  const [fileStats, setFileStats] = useState(null);
  const fileInputRef = useRef(null);

  const { showNotification } = useNotification();

  // Reset form when modal closes
  const handleClose = () => {
    resetForm();
    setUploadProgress(0);
    setUserData([]);
    setFileStats(null);
    onClose();
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files[0];
    processFile(file);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    event.stopPropagation();

    const file = event.dataTransfer.files[0];
    processFile(file);
  };

  const processFile = async (file) => {
    if (!file) return;

    // Reset errors
    setErrors({});

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      setErrors({ file: "File size exceeds the 1MB limit. Please select a smaller file." });
      showNotification("File size exceeds the 1MB limit", "error");
      return;
    }

    // Validate file type
    if (file.type !== ALLOWED_FILE_TYPE) {
      setErrors({ file: "Please select a valid Excel file (.xlsx)." });
      showNotification("Invalid file type. Please select an Excel file (.xlsx)", "error");
      return;
    }

    // Create synthetic event for the form hook
    const syntheticEvent = {
      target: {
        name: 'file',
        files: [file]
      }
    };

    handleFileChange(syntheticEvent);
    simulateUpload();

    try {
      // Parse Excel file
      const { validData, stats } = await parseExcel(file);

      // Add UPDATE_PASSWORD required action for Keycloak
      const validDataWithRequiredActions = validData.map(user => ({
        ...user,
        requiredActions: ["UPDATE_PASSWORD"]
      }));

      setUserData(validDataWithRequiredActions);
      setFileStats(stats);

      // Show warnings about invalid emails
      if (stats.invalid > 0) {
        const warningMessage = `${stats.invalid} of ${stats.total} entries have invalid email addresses and will be skipped.`;
        showNotification(warningMessage, "warning");
      }

      if (validData.length === 0) {
        setErrors({ file: "No valid user data found in the file. Please check that all email addresses are valid." });
      } else {
        showNotification(`File processed. Ready to import ${validData.length} valid users.`, "success");
      }
    } catch (error) {
      console.error("Error parsing file:", error);
      setErrors({ file: error.message || "Failed to parse Excel file" });
    }
  };

  const simulateUpload = () => {
    let progress = 0;
    setUploadProgress(0);

    const interval = setInterval(() => {
      progress += 10;
      setUploadProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
      }
    }, 50);
  };

  const handleClearFile = () => {
    resetForm();
    setUploadProgress(0);
    setUserData([]);
    setFileStats(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const handleDownloadTemplate = async () => {
    setIsTemplateLoading(true);

    try {
      // Create a template with the structure expected for users
      const worksheet = XLSX.utils.json_to_sheet([
        {
          firstName: "John",
          lastName: "Doe",
          email: "john.doe@example.com",
          role: "Participant",
          temporaryPassword: "Temp1234!"
        },
        {
          firstName: "Jane",
          lastName: "Smith",
          email: "jane.smith@example.com",
          role: "Speaker",
          temporaryPassword: "Temp5678!"
        }
      ]);

      // Adjust column widths for better readability
      const wscols = [
        { wch: 15 }, { wch: 15 }, { wch: 25 }, { wch: 15 }, { wch: 20 }
      ];
      worksheet['!cols'] = wscols;

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Users");

      // Generate and download the file
      XLSX.writeFile(workbook, "users_template.xlsx");

      showNotification("Template downloaded successfully", "success");
    } catch (error) {
      console.error("Error generating template:", error);
      showNotification("Failed to generate template", "error");
    } finally {
      setIsTemplateLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate before submission
    if (!values.file) {
      setErrors({ file: "Please select a file to import" });
      return;
    }

    if (userData.length === 0) {
      setErrors({ file: "No valid user data found in the file. Please check that all email addresses include the @ symbol." });
      return;
    }

    setIsLoading(true);

    try {
      // All validation was already done during file processing
      await onImport(userData);

      // Clear the file after successful import
      resetForm();
      setUserData([]);
      setFileStats(null);

      // Close the modal
      onClose();

      showNotification(`Successfully imported ${userData.length} users`, "success");
    } catch (error) {
      console.error("Error importing users:", error);
      setErrors({
        submit: error.message || "Failed to import users"
      });
      showNotification(error.message || "Failed to import users", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const preventDefaults = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  // Define event handlers for drag and drop
  const dragEvents = {
    onDragEnter: preventDefaults,
    onDragOver: preventDefaults,
    onDragLeave: preventDefaults,
    onDrop: handleDrop
  };

  // Don't render if not open
  if (!isOpen) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-4xl">
        <h3 className="font-bold text-xl mb-6">Import Users from Excel</h3>

        {/* Error message for submission */}
        {errors.submit && (
          <div className="alert alert-error mb-4">
            <span>{errors.submit}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* File upload area */}
          <div
            className={`border-2 border-dashed rounded-lg p-6 text-center mb-6 ${errors.file ? 'border-error' : 'border-gray-300'}`}
            {...dragEvents}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileInputChange}
              className="hidden"
              accept=".xlsx"
            />

            {!values.file ? (
              <div className="py-8">
                <FiUpload className="mx-auto text-4xl mb-4 text-gray-400" />
                <p className="text-lg mb-3">Drag and drop an Excel file, or</p>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleBrowseClick}
                >
                  Browse Files
                </button>
                <p className="text-sm mt-4 text-gray-500">Supports .xlsx files up to 1MB</p>
              </div>
            ) : (
              <div className="py-4">
                <div className="flex items-center justify-center gap-3 mb-3">
                  <FaFile className="text-2xl text-primary" />
                  <span className="font-medium">{values.file.name}</span>
                  <button
                    type="button"
                    className="btn btn-circle btn-xs btn-error"
                    onClick={handleClearFile}
                  >
                    <FaTrash />
                  </button>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
                  <div
                    className="bg-primary h-2.5 rounded-full"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>

                <div className="text-sm">
                  <span className="text-success">File processed</span>
                  {fileStats && (
                    <div className="mt-1">
                      {fileStats.valid > 0 ? (
                        <span className="text-success">Found {fileStats.valid} valid users ready to import</span>
                      ) : null}
                      {fileStats.invalid > 0 && (
                        <span className="text-warning block mt-1">
                          {fileStats.invalid} entries with invalid emails will be skipped
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {errors.file && (
              <div className="mt-2 text-error text-sm">{errors.file}</div>
            )}
          </div>

          {/* Template download and import buttons */}
          <div className="flex flex-col sm:flex-row justify-between gap-4 mt-6">
            <button
              type="button"
              className="btn btn-outline"
              onClick={handleDownloadTemplate}
              disabled={isTemplateLoading}
            >
              {isTemplateLoading ? <FaSpinner className="animate-spin mr-2" /> : <FaDownload className="mr-2" />}
              Download Template
            </button>

            <div className="flex gap-4">
              <button
                type="button"
                className="btn btn-ghost"
                onClick={handleClose}
                disabled={isLoading}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={isLoading || !values.file || userData.length === 0}
              >
                {isLoading ? <FaSpinner className="animate-spin mr-2" /> : null}
                Import {userData.length} Users
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

UserExcelImport.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onImport: PropTypes.func.isRequired
}; 