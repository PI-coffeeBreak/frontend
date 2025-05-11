 import { useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { FiUpload } from "react-icons/fi";
import { FaFile, FaTrash, FaDownload, FaSpinner } from "react-icons/fa";
import * as XLSX from 'xlsx';
import { Modal } from "../common/Modal";
import { useNotification } from "../../contexts/NotificationContext";
import { useForm } from "../../hooks/useForm";
import {MAX_FILE_SIZE} from "../../consts.js";
import {ALLOWED_FILE_TYPE} from "../../consts.js";

const formatExcelData = (rawData) => {
  return rawData.map(row => ({
    name: row.name || "",
    description: row.description || "",
    image: row.image || "",
    date: row.date || null,
    duration: isNaN(parseInt(row.duration)) ? 0 : parseInt(row.duration),
    type_id: isNaN(parseInt(row.type_id)) ? 0 : parseInt(row.type_id),
    topic: row.topic || "",
    facilitator: row.facilitator || ""
  }));
};

const processWorkbook = (data) => {
  const workbook = XLSX.read(new Uint8Array(data), { type: 'array' });

  const firstSheetName = workbook.SheetNames[0];
  if (!firstSheetName) {
    throw new Error("Excel file contains no sheets");
  }
  
  const worksheet = workbook.Sheets[firstSheetName];

  return XLSX.utils.sheet_to_json(worksheet, {
    raw: false,
    defval: ""
  });
};

const parseExcel = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const rawData = processWorkbook(e.target.result);

        const formattedData = formatExcelData(rawData);
        
        console.log("Parsed Excel data:", formattedData);
        resolve(formattedData);
      } catch (error) {
        console.error("Error parsing Excel:", error);
        reject(new Error("Failed to parse Excel file. Please ensure it's a valid Excel format."));
      }
    };
    
    reader.onerror = (error) => reject(error);

    reader.readAsArrayBuffer(file);
  });
};


export function ExcelImportModal({ isOpen, onClose, onImport }) {

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

    setErrors({});

    if (file.size > MAX_FILE_SIZE) {
      setErrors({ file: "File size exceeds the 1MB limit. Please select a smaller file." });
      showNotification("File size exceeds the 1MB limit", "error");
      return;
    }

    if (file.type !== ALLOWED_FILE_TYPE) {
      setErrors({ file: "Please select a valid Excel file (.xlsx)." });
      showNotification("Invalid file type. Please select an Excel file (.xlsx)", "error");
      return;
    }

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
      const worksheet = XLSX.utils.json_to_sheet([
        {
          name: "Example Activity",
          description: "Description of the activity",
          date: "2025-04-20T10:00:00",
          duration: 60,
          type_id: 1,
          topic: "Example Topic",
          facilitator: "Example Facilitator"

        }
      ]);
      
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Activities");

      XLSX.writeFile(workbook, "activity_template.xlsx");
      
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

    if (!values.file) {
      setErrors({ file: "Please select a file to import" });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const activitiesData = await parseExcel(values.file);
      
      if (!activitiesData.length) {
        throw new Error("No valid activities found in the Excel file");
      }

      // The API expects a JSON array directly, not FormData
      await onImport(activitiesData);

      resetForm();

      onClose();
      
      showNotification("Activities successfully imported", "success");
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
            className="btn btn-primary"
            disabled={!values.file || isLoading}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <span className="loading loading-spinner loading-sm"></span>
                <span>Processing...</span>
              </div>
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