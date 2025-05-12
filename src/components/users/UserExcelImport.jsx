import { useState } from 'react';
import PropTypes from 'prop-types';
import * as XLSX from 'xlsx';
import { Modal } from "../common/Modal";
import { useNotification } from "../../contexts/NotificationContext";
import { generateRandomPassword } from "../../utils/passwordUtils";
import { ExcelImportHelper } from "../common/ExcelImportHelper";

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
          data: validData,
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

// Create template
const generateTemplate = () => {
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
  
  return workbook;
};

/**
 * Modal for importing users from Excel file
 */
export function UserExcelImport({ isOpen, onClose, onImport }) {
  const [isLoading, setIsLoading] = useState(false);
  const { showNotification } = useNotification();

  const excelHelper = ExcelImportHelper({
    onParseExcel: parseExcel,
    generateTemplate,
    templateFileName: "users_template.xlsx",
    templateButtonText: "Download Excel Template",
    importButtonText: "Import Users",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate before submission
    if (!excelHelper.values.file) {
      excelHelper.setErrors({ file: "Please select a file to import" });
      return;
    }

    if (!excelHelper.parsedData || excelHelper.parsedData.length === 0) {
      excelHelper.setErrors({ file: "No valid user data found in the file. Please check that all email addresses include the @ symbol." });
      return;
    }

    setIsLoading(true);
    excelHelper.setIsLoading(true);

    try {
      // Add UPDATE_PASSWORD required action for Keycloak
      const dataWithRequiredActions = excelHelper.parsedData.map(user => ({
        ...user,
        requiredActions: ["UPDATE_PASSWORD"]
      }));
      
      // Import the data
      await onImport(dataWithRequiredActions);

      // Clear the file after successful import
      excelHelper.resetForm();
      excelHelper.setParsedData(null);
      excelHelper.setFileStats(null);

      // Close the modal
      onClose();

      showNotification(`Successfully imported ${dataWithRequiredActions.length} users`, "success");
    } catch (error) {
      console.error("Error importing users:", error);
      excelHelper.setErrors({
        submit: error.message || "Failed to import users"
      });
      showNotification(error.message || "Failed to import users", "error");
    } finally {
      setIsLoading(false);
      excelHelper.setIsLoading(false);
    }
  };

  // Reset form when modal closes
  const handleClose = () => {
    excelHelper.resetForm();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Import Users from Excel"
      description="Select an Excel file to upload multiple users at once."
    >
      {/* Error message for submission */}
      {excelHelper.errors.submit && (
        <div className="alert alert-error mb-4">
          <span>{excelHelper.errors.submit}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {excelHelper.renderTemplateButton()}
        {excelHelper.renderDropZone()}
        {excelHelper.renderErrorMessage()}
        {excelHelper.renderFilePreview()}
        {excelHelper.renderFileInput()}

        <div className="mt-6 flex justify-end gap-2">
          {excelHelper.renderSubmitButton()}
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