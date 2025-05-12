import { useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { FiUpload } from "react-icons/fi";
import { FaFile, FaTrash, FaDownload, FaSpinner } from "react-icons/fa";
import * as XLSX from 'xlsx';
import { Modal } from "../common/Modal";
import { useNotification } from "../../contexts/NotificationContext";
import { useForm } from "../../hooks/useForm";
import { generateRandomPassword } from "../../utils/passwordUtils";
import { MAX_FILE_SIZE, ALLOWED_FILE_TYPE } from "../../consts.js";

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

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Import Users from Excel"
      description="Select an Excel file to upload multiple users at once."
    >
      {/* Error message for submission */}
      {errors.submit && (
        <div className="alert alert-error mb-4">
          <span>{errors.submit}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <button 
          type="button"
          className="btn btn-secondary rounded-xl w-full"
          onClick={handleDownloadTemplate}
          disabled={isTemplateLoading}
        >
          {isTemplateLoading ? (
            <div className="flex items-center gap-2">
              <FaSpinner className="animate-spin" />
              <span>Generating Template...</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <FaDownload />
              <span>Download Excel Template</span>
            </div>
          )}
        </button>

        <button
          type="button"
          className={`w-full border-dashed border-2 rounded-xl p-4 mt-4 text-center bg-transparent ${
            errors.file ? 'border-error' : 'border-gray-400'
          }`}
          onClick={handleBrowseClick}
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
        >
          <div className="rounded-full bg-base-content w-16 h-16 mx-auto my-4 flex items-center justify-center">
            <FiUpload className="text-base-100 text-2xl" aria-hidden="true" />
          </div>
          
          <p>
            Drag and drop your Excel file here or
            {' '}
            <span className="text-primary font-bold">Browse</span>
          </p>
          
          <p className="text-sm text-gray-400">
            Maximum file size: 1MB
          </p>
        </button>

        {errors.file && (
          <div className="mt-2 text-sm text-error">
            {errors.file}
          </div>
        )}

        {values.file && (
          <div className="bg-base-200 w-full p-4 mt-4 rounded-lg relative">
            <button
              onClick={handleClearFile}
              className="text-primary hover:text-error absolute right-3 top-3"
              type="button"
              aria-label="Remove file"
            >
              <FaTrash aria-hidden="true" />
              <span className="sr-only">Remove file</span>
            </button>
            
            <div className="flex items-center gap-3">
              <FaFile className="text-2xl text-primary" />
              <div>
                <p className="font-medium">{values.file.name}</p>
                <p className="text-sm text-gray-500">
                  {(values.file.size / 1024).toFixed(2)} KB
                </p>
              </div>
            </div>
            
            <div className="mt-2">
              <progress 
                className="progress progress-primary w-full" 
                value={uploadProgress} 
                max="100"
              />
              <p className="text-xs text-right mt-1">{uploadProgress}%</p>
            </div>

            {fileStats && (
              <div className="mt-2 text-sm">
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
        )}

        <input
          type="file"
          ref={fileInputRef}
          name="file"
          className="hidden"
          accept=".xlsx"
          onChange={handleFileInputChange}
          aria-label="Upload Excel file"
        />

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="submit"
            className="btn btn-primary rounded-xl"
            disabled={!values.file || isLoading || userData.length === 0}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <span className="loading loading-spinner loading-sm"></span>
                <span>Processing...</span>
              </div>
            ) : (
              `Import ${userData.length > 0 ? userData.length : ''} Users`
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}

UserExcelImport.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onImport: PropTypes.func.isRequired
}; 