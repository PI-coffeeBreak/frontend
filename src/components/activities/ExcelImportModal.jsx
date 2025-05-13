
import PropTypes from 'prop-types';
import * as XLSX from 'xlsx';
import { Modal } from "../common/Modal";
import { useNotification } from "../../contexts/NotificationContext";
import { ExcelImportHelper } from "../common/ExcelImportHelper";

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

// Create template
const generateTemplate = () => {
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

  return workbook;
};

export function ExcelImportModal({ isOpen, onClose, onImport }) {

  const { showNotification } = useNotification();

  const excelHelper = ExcelImportHelper({
    onParseExcel: parseExcel,
    generateTemplate,
    templateFileName: "activity_template.xlsx",
    templateButtonText: "Download Excel Template",
    importButtonText: "Import Activities"
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!excelHelper.values.file) {
      excelHelper.setErrors({ file: "Please select a file to import" });
      return;
    }

    
    try {
      const activitiesData = excelHelper.parsedData;
      
      if (!activitiesData?.length) {
        throw new Error("No valid activities found in the Excel file");
      }

      // The API expects a JSON array directly, not FormData
      await onImport(activitiesData);

      excelHelper.resetForm();
      excelHelper.setParsedData(null);

      onClose();
      
      showNotification("Activities successfully imported", "success");
    } catch (error) {
      console.error("Error processing file:", error);
      excelHelper.setErrors({ 
        submit: error.message || "Failed to process file" 
      });
      showNotification(error.message || "Failed to process file", "error");
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
      title="Upload Excel File"
      description="Select an Excel file to upload multiple sessions at once."
    >
      <form onSubmit={handleSubmit}>
        {excelHelper.renderTemplateButton()}
        {excelHelper.renderDropZone()}
        {excelHelper.renderErrorMessage()}

        {excelHelper.errors.submit && (
          <div className="mt-2 text-sm text-error">
            {excelHelper.errors.submit}
          </div>
        )}

        {excelHelper.renderFilePreview()}
        {excelHelper.renderFileInput()}

        <div className="mt-6 flex justify-end gap-2">
          {excelHelper.renderSubmitButton()}
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