import { useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { FiUpload } from "react-icons/fi";
import { FaFile, FaTrash, FaDownload, FaSpinner } from "react-icons/fa";
import * as XLSX from 'xlsx';
import { useNotification } from "../../contexts/NotificationContext";
import { useForm } from "../../hooks/useForm";
import { MAX_FILE_SIZE, ALLOWED_FILE_TYPE } from "../../consts.js";

/**
 * A reusable helper component for Excel file imports
 */
export function ExcelImportHelper({
  onParseExcel,
  generateTemplate,
  templateFileName,
  templateButtonText = "Download Excel Template",
  importButtonText = "Import",
  fileValidationFn = null,
}) {
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
  const [parsedData, setParsedData] = useState(null);
  const [fileStats, setFileStats] = useState(null);
  const fileInputRef = useRef(null);

  const { showNotification } = useNotification();

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
    setParsedData(null);
    setFileStats(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
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
      // Parse Excel file using the provided parser function
      const result = await onParseExcel(file);
      
      // Store parsed data
      setParsedData(result.data || result);
      
      // If stats are provided, store them
      if (result.stats) {
        setFileStats(result.stats);
        
        // Show warnings about invalid data if applicable
        if (result.stats.invalid > 0) {
          const warningMessage = `${result.stats.invalid} of ${result.stats.total} entries are invalid and will be skipped.`;
          showNotification(warningMessage, "warning");
        }
      }
      
      // Run additional validation if provided
      if (fileValidationFn) {
        const validationResult = fileValidationFn(result.data || result);
        if (validationResult && !validationResult.valid) {
          setErrors({ file: validationResult.message });
          return;
        }
      }
      
      if ((result.data && result.data.length === 0) || 
          (!result.data && result.length === 0)) {
        setErrors({ file: "No valid data found in the file." });
      } else {
        showNotification(`File processed successfully.`, "success");
      }
    } catch (error) {
      console.error("Error parsing file:", error);
      setErrors({ file: error.message || "Failed to parse Excel file" });
    }
  };

  const handleDownloadTemplate = async () => {
    setIsTemplateLoading(true);

    try {
      // Use the provided template generator function
      const workbook = await generateTemplate();
      
      // Generate and download the file
      XLSX.writeFile(workbook, templateFileName);

      showNotification("Template downloaded successfully", "success");
    } catch (error) {
      console.error("Error generating template:", error);
      showNotification("Failed to generate template", "error");
    } finally {
      setIsTemplateLoading(false);
    }
  };

  // Return the state and handlers
  return {
    values,
    errors,
    setErrors,
    uploadProgress,
    isLoading,
    setIsLoading,
    isTemplateLoading,
    parsedData,
    fileStats,
    fileInputRef,
    resetForm,
    setParsedData,
    setFileStats,
    handleDownloadTemplate,
    handleBrowseClick,
    handleDrop,
    handleClearFile,
    handleFileInputChange,
    renderTemplateButton: () => (
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
            <span>{templateButtonText}</span>
          </div>
        )}
      </button>
    ),
    renderDropZone: () => (
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
    ),
    renderErrorMessage: () => (
      errors.file && (
        <div className="mt-2 text-sm text-error">
          {errors.file}
        </div>
      )
    ),
    renderFilePreview: () => (
      values.file && (
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
                <span className="text-success">Found {fileStats.valid} valid entries ready to import</span>
              ) : null}
              {fileStats.invalid > 0 && (
                <span className="text-warning block mt-1">
                  {fileStats.invalid} invalid entries will be skipped
                </span>
              )}
            </div>
          )}
        </div>
      )
    ),
    renderFileInput: () => (
      <input
        type="file"
        ref={fileInputRef}
        name="file"
        className="hidden"
        accept=".xlsx"
        onChange={handleFileInputChange}
        aria-label="Upload Excel file"
      />
    ),
    renderSubmitButton: () => (
        <button
            type="submit"
            className="btn btn-primary rounded-xl"
            disabled={!values.file || isLoading || (parsedData && parsedData.length === 0)}
        >
          {isLoading ? (
              <div className="flex items-center gap-2">
                <span className="loading loading-spinner loading-sm"></span>
                <span>Processing...</span>
              </div>
          ) : (
              <div className="flex items-center gap-2">
                <span>{importButtonText}{parsedData && parsedData.length > 0 ? ` (${parsedData.length})` : ''}</span>
              </div>
          )}
        </button>
    )
  };
}

ExcelImportHelper.propTypes = {
  onParseExcel: PropTypes.func.isRequired,
  generateTemplate: PropTypes.func.isRequired,
  templateFileName: PropTypes.string.isRequired,
  templateButtonText: PropTypes.string,
  importButtonText: PropTypes.string,
  fileValidationFn: PropTypes.func
}; 