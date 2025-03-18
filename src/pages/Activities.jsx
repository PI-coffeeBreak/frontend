import { FiUpload } from "react-icons/fi";
import { FaPlus, FaFile } from "react-icons/fa";
import { FaFileExcel } from "react-icons/fa6";
import { FaTrash } from "react-icons/fa";
import CreateCard from "../components/CreateCard.jsx";
import {useState} from "react";

export default function Activities() {
    const [feedbackMessage, setFeedbackMessage] = useState("");
    const [selectedFile, setSelectedFile] = useState(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const MAX_FILE_SIZE = 1024 * 1024; // temos que escolher quanto queremos depois

    const handleBrowseClick = () => {
        document.getElementById('file-input').click();
    };

    const handleFileChange = (event) => {
        const file = event.target.files[0];

        if (file) {
            if (file.size > MAX_FILE_SIZE) {
                setFeedbackMessage("File size exceeds the 5MB limit. Please select a smaller file.");
            } else if (file.type !== "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") {
                setFeedbackMessage("Please select a valid Excel file.");
            } else {
                setSelectedFile(file);
                setFeedbackMessage("File selected successfully!");
                simulateUpload();
            }
        }
    };

    const simulateUpload = () => {
        let progress = 0;
        const interval = setInterval(() => {
            progress += 10;
            setUploadProgress(progress);
            if (progress >= 100) {
                clearInterval(interval);
            }
        }, 50);
    };

    const handleDragOver = (event) => {
        event.preventDefault();
        event.stopPropagation();
    };

    const handleDrop = (event) => {
        event.preventDefault();
        event.stopPropagation();
        const files = event.dataTransfer.files;

        if (files.length > 0) {
            const file = files[0];

            if (file.size > MAX_FILE_SIZE) {
                setFeedbackMessage("File size exceeds the 5MB limit. Please drop a smaller file.");
            } else if (file.type !== "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") {
                setFeedbackMessage("Please drop a valid Excel file.");
            } else {
                setSelectedFile(file);
                setFeedbackMessage("File dropped successfully!");
                simulateUpload();
            }
        }
    };

    const handleClearFile = () => {
        setSelectedFile(null);
        setFeedbackMessage("");
        setUploadProgress(0);
    };

    const openExcelModal = () => {
        document.getElementById('excel_modal').showModal();
    };

    const openNewSessionModal = () => {
        document.getElementById('new_session_modal').showModal();
    };

    return (
        <>
            <div className="w-full min-h-svh p-8">
                <h1 className="text-3xl font-bold">Create Sessions</h1>
                <div className="grid grid-cols-3 gap-4 mt-8">
                    <CreateCard
                        icon={FaFileExcel}
                        title="Add with an excel file"
                        description="Upload an Excel file to quickly add multiple sessions at once."
                        onClick={openExcelModal}
                    />
                    <CreateCard
                        icon={FaPlus}
                        title="Create a new session"
                        description="Create a new session manually."
                        onClick={openNewSessionModal}
                    />
                </div>
                <h1 className="text-3xl font-bold mt-8">Sessions</h1>
            </div>

            <dialog id="excel_modal" className="modal">
                <div className="modal-box">
                    <form method="dialog">
                        <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
                    </form>
                    <h3 className="text-lg font-bold">Upload Excel File</h3>
                    <p className="py-4">Select an Excel file to upload multiple sessions at once.</p>

                    <a href="/activityTemplate.xlsx" download>
                        <button className="btn btn-secondary mt-4 w-full">Download Excel Template</button>
                    </a>

                    <div
                        id="drop-area"
                        className="border-dashed border-2 rounded-xl border-gray-400 p-4 mt-4 text-center"
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                    >
                        <div className="rounded-full bg-base-content w-24 mx-auto my-4 h-24 flex items-center justify-center">
                            <FiUpload className="text-base-100 text-4xl mb-2" />
                        </div>
                        <p>Drag and drop your Excel file here or <span className="text-primary font-bold hover:underline hover:cursor-pointer" onClick={handleBrowseClick}>Browse</span></p>
                        <p className="text-sm text-gray-300">Pick up a file up to 1MB</p>
                        {feedbackMessage && (
                            <>
                                <div className="mt-4 text-center text-sm text-red-500">{feedbackMessage}</div>
                                <div className="bg-secondary w-full h-20 mt-4 mx-auto rounded-lg relative">
                                    <button
                                        onClick={handleClearFile}
                                        className="text-primary hover:cursor-pointer absolute right-3 top-3"
                                    >
                                        <FaTrash />
                                    </button>
                                    {selectedFile && (
                                        <>
                                            <div className="flex text-4xl gap-4">
                                                <div className="mt-3 ml-1">
                                                    <FaFile />
                                                </div>
                                                <div className="mt-1">
                                                    <p className="text-lg text-left">{selectedFile.name}</p>
                                                    <p className="text-sm text-left">{(selectedFile.size / 1024).toFixed(2)} KB</p>
                                                </div>
                                            </div>
                                            <div>
                                                <progress className="progress progress-primary w-88 absolute left-2 bottom-2" value={uploadProgress} max="100"></progress>
                                                <p className="absolute right-2 bottom-1">{uploadProgress}%</p>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                    <input
                        type="file"
                        id="file-input"
                        style={{ display: 'none' }}
                        accept=".xlsx,.xls"
                        onChange={handleFileChange}
                    />
                    <button
                        className="btn btn-primary mt-4 mx-auto w-1/3 flex items-center justify-center"
                    >
                        Submit
                    </button>
                </div>


                <form method="dialog" className="modal-backdrop bg-opacity-10">
                    <button>close</button>
                </form>
            </dialog>

            <dialog id="new_session_modal" className="modal">
                <div className="modal-box">
                    <form method="dialog">
                        <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
                    </form>
                    <h3 className="text-lg font-bold">Create New Session</h3>
                    <p className="py-4">Fill in the details to create a new session.</p>
                </div>
                <form method="dialog" className="modal-backdrop bg-none bg-opacity-10">
                    <button>close</button>
                </form>
            </dialog>
        </>
    );
}