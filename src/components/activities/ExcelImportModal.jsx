import { useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { FiUpload } from "react-icons/fi";
import { FaFile, FaTrash, FaDownload, FaSpinner } from "react-icons/fa";
import { Modal } from "../common/Modal";
import { useNotification } from "../../contexts/NotificationContext";
import { useActivities } from "../../contexts/ActivitiesContext";
import { useForm } from "../../hooks/useForm";

// Constants
const MAX_FILE_SIZE = 1024 * 1024; // 1MB
const ALLOWED_FILE_TYPE = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

/**
 * Modal for importing activities from Excel file
 */
export function ExcelImportModal({ isOpen, onClose, onImport }) {
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
  const fileInputRef = useRef(null);
  
  const { showNotification } = useNotification();
  const { activityTypes } = useActivities();

  // Reset form when modal closes
  const handleClose = () => {
    resetForm();
    setUploadProgress(0);
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

  const processFile = (file) => {
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
      // Generate template URL based on activity types
      const templateUrl = '/api/activities/template?format=xlsx';
      
      // Fetch the template
      const response = await fetch(templateUrl);
      
      if (!response.ok) {
        throw new Error('Failed to download template');
      }
      
      // Create a blob and trigger download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = 'activity_template.xlsx';
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      showNotification("Template downloaded successfully", "success");
    } catch (error) {
      console.error("Error downloading template:", error);
      showNotification("Failed to download template", "error");
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
    
    setIsLoading(true);
    
    try {
      // Use FileReader to read the file content
      const reader = new FileReader();
      
      reader.onload = async (event) => {
        try {
          // Create FormData for file upload
          const formData = new FormData();
          formData.append('file', values.file);
          
          // Call the import function provided as prop
          await onImport(formData);
          
          // Clear the file after successful import
          resetForm();
          
          // Close the modal
          onClose();
        } catch (error) {
          console.error("Error processing file:", error);
          setErrors({ 
            submit: error.message || "Failed to process file" 
          });
          showNotification(error.message || "Failed to process file", "error");
        } finally {
          setIsLoading(false);
        }
      };
      
      reader.onerror = () => {
        setErrors({ submit: "Error reading file" });
        showNotification("Error reading file", "error");
        setIsLoading(false);
      };
      
      reader.readAsArrayBuffer(values.file);
    } catch (error) {
      console.error("Error handling file:", error);
      setErrors({ submit: error.message || "Failed to process file" });
      showNotification(error.message || "Failed to process file", "error");
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Upload Excel File"
      description="Select an Excel file to upload multiple sessions at once."
    >
      <form onSubmit={handleSubmit}>
        <button 
          type="button"
          className="btn btn-secondary w-full"
          onClick={handleDownloadTemplate}
          disabled={isTemplateLoading}
        >
          {isTemplateLoading ? (
            <>
              <FaSpinner className="animate-spin mr-2" />
              Generating Template...
            </>
          ) : (
            <>
              <FaDownload className="mr-2" />
              Download Excel Template
            </>
          )}
        </button>

        <div
          className={`border-dashed border-2 rounded-xl p-4 mt-4 text-center cursor-pointer ${
            errors.file ? 'border-error' : 'border-gray-400'
          }`}
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={handleBrowseClick}
        >
          <div className="rounded-full bg-base-content w-16 h-16 mx-auto my-4 flex items-center justify-center">
            <FiUpload className="text-base-100 text-2xl" />
          </div>
          
          <p>
            Drag and drop your Excel file here or{" "}
            <span className="text-primary font-bold">Browse</span>
          </p>
          
          <p className="text-sm text-gray-400">
            Maximum file size: 1MB
          </p>
        </div>

        {errors.file && (
          <div className="mt-2 text-sm text-error">
            {errors.file}
          </div>
        )}

        {errors.submit && (
          <div className="mt-2 text-sm text-error">
            {errors.submit}
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
              <FaTrash />
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
            type="button"
            className="btn btn-outline"
            onClick={handleClose}
          >
            Cancel
          </button>
          
          <button
            type="submit"
            className="btn btn-primary"
            disabled={!values.file || isLoading}
          >
            {isLoading ? (
              <>
                <span className="loading loading-spinner loading-sm"></span>
                Processing...
              </>
            ) : (
              "Import Activities"
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}

ExcelImportModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onImport: PropTypes.func.isRequired
};

export default ExcelImportModal;