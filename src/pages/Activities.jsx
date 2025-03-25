import { FiUpload } from "react-icons/fi";
import { FaPlus, FaFile } from "react-icons/fa";
import { FaFileExcel } from "react-icons/fa6";
import { FaTrash } from "react-icons/fa";
import { FaExclamationTriangle } from "react-icons/fa";
import { FaCheck } from "react-icons/fa";
import CreateCard from "../components/CreateCard.jsx";
import {useState, useEffect} from "react";
import Activity from "../components/Activity.jsx";
import { MdError } from "react-icons/md";
import * as XLSX from "xlsx";
import axios from 'axios';

export default function Activities() {
    const [newSession, setNewSession] = useState({
        name: "",
        description: "",
        image: "",
        date: "",
        duration: 30,
        type_id: 1,
        topic: "",
        speaker: "",
        facilitator:  ""
    });
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedType, setSelectedType] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [imagePreview, setImagePreview] = useState(null);
    const [feedbackMessage, setFeedbackMessage] = useState("");
    const [selectedFile, setSelectedFile] = useState(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [activityTypes, setActivityTypes] = useState([]);
    let [activities, setActivities] = useState([]);
    const MAX_FILE_SIZE = 1024 * 1024;

    const fetchActivityTypes = async () => {
        try {
            const response = await axios.get('http://localhost:8000/api/v1/activity-types/');
            console.log("Activity Types:", response.data);
            setActivityTypes(response.data);
        } catch (error) {
            console.error("Error fetching activity types:", error);
        }
    }

    const fetchActivities = async () => {
        try {
            const response = await axios.get('http://localhost:8000/api/v1/activities/');
            console.log("Activities:", response.data);
            setActivities(response.data);
        } catch (error) {
            console.error("Error fetching activities:", error);
        }
    }



    //FILTERS
    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
    };

    const handleTypeChange = (e) => {
        setSelectedType(e.target.value);
    };

    const filteredActivities = activities.filter((activity) => {
        const matchesSearch = activity.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            activity.description.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesType = selectedType ? activity.type_id === parseInt(selectedType) : true;

        return matchesSearch && matchesType;
    });



    const getActivityTypeID = (type) => {
        const normalizedType = type.trim().toLowerCase();

        for (let i = 0; i < activityTypes.length; i++) {
            if (activityTypes[i].type.toLowerCase() === normalizedType) {
                return activityTypes[i].id;
            }
        }

        return "Type not found";
    };

    const getActivityType = (typeId) => {
        for (let i = 0; i < activityTypes.length; i++) {
            if (activityTypes[i].id === typeId) {
                return activityTypes[i].type;
            }
        }

        return "Type not found";
    };



    const prepareDataForPost = (json) => {
        const activities = [];
        for (let i = 0; i < json.length; i++) {
            json[i].type_id = getActivityTypeID(json[i].type);
            delete json[i].type;

            activities.push({
                name: json[i].name,
                description: json[i].description,
                image: json[i].image,
                date: json[i].date,
                duration: json[i].duration,
                type_id: json[i].type_id,
                topic: json[i].topic,
                speaker: json[i].speaker,
                facilitator: json[i].facilitator
            })
        }

        return activities;
    };




    var ExcelToJSON = function() {
        this.parseExcel = function(file) {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = function(e) {
                    const data = e.target.result;
                    const workbook = XLSX.read(data, {type: 'binary'});

                    let jsonData = [];

                    workbook.SheetNames.forEach(function(sheetName) {
                        const XL_row_object = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[sheetName]);
                        console.log(`Data from sheet: ${sheetName}`);
                        console.log(XL_row_object);

                        jsonData = jsonData.concat(XL_row_object);
                    });

                    resolve(jsonData);
                };
                reader.onerror = function(ex) {
                    reject(ex);
                };
                reader.readAsBinaryString(file);
            });
        };
    };

    useEffect(() => {
        fetchActivityTypes();
        fetchActivities();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewSession((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const handleExcelFileChange = (e) => {
        const file = e.target.files[0];

        if (file) {
            const excelToJson = new ExcelToJSON();
            excelToJson.parseExcel(file).then(jsonData => {
                activities = prepareDataForPost(jsonData);
                setSelectedFile(file);
            }).catch(error => {
                console.error("Error processing excel file:", error);
            }
        );

        return activities

        } else {
            console.log("No file selected.");
        }

    };

    const handleExcelFileChangeDrop = (file) => {
        if (file) {
            const excelToJson = new ExcelToJSON();
            excelToJson.parseExcel(file).then(jsonData => {
                activities = prepareDataForPost(jsonData);
                console.log(activities);
            }).catch(error => {
                console.error("Error processing excel file:", error);
            });
        } else {
            console.log("No file selected.");
        }
    };

    const handleExcelSubmit = async (e) => {
        e.preventDefault()
        try {
            const response = await axios.post('http://localhost:8000/api/v1/activities/batch', activities);
            console.log('Data sent successfully', response);
            setFeedbackMessage("Activities added successfully!");
            setErrorMessage("");
            document.getElementById("excel_modal").close();
        } catch (error) {
            console.error('Error sending the data:', error);

            if (error.response) {
                setErrorMessage(`API Error: ${error.response.data.message || 'An error occurred'}`);
                document.getElementById("excel_modal").close();
            } else if (error.request) {
                setErrorMessage('No response received from the server. Please try again later.');
                document.getElementById("excel_modal").close();
            } else {
                setErrorMessage(`Unexpected error: ${error.message}`);
                document.getElementById("excel_modal").close();
            }
        }

        fetchActivities();
    };


    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setNewSession((prev) => ({
                ...prev,
                image: file
            }));
            setImagePreview(URL.createObjectURL(file));
        }
    };



    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!newSession.name || !newSession.description || !newSession.type_id) {
            setErrorMessage("Name, Description, and Type are required.");
            return;
        }

        console.log(newSession.date)

        const activity = {
            name: newSession.name,
            description: newSession.description,
            image: newSession.image,
            date: newSession.date,
            duration: newSession.duration,
            type_id: newSession.type_id,
            topic: newSession.topic,
            speaker: newSession.speaker,
            facilitator: newSession.facilitator
        }


        try {
            const response = await axios.post('http://localhost:8000/api/v1/activities', activity);
            setFeedbackMessage("Activities added successfully!");
            setErrorMessage("");
            document.getElementById("excel_modal").close();
            if (response.ok) {
                setNewSession({
                    name: "",
                    description: "",
                    image: "",
                    date: "",
                    duration: 30,
                    type_id: 1,
                    topic: "",
                    speaker: "",
                    facilitator: ""
                });
                setImagePreview(null);
                setErrorMessage("");
                alert("Activity created successfully!");
                fetchActivities();
            } else {
                setErrorMessage("Error creating activity.");
            }
        } catch{
            setErrorMessage("Error creating activity.");
        }
    };

    const handleBrowseClick = () => {
        document.getElementById('file-input').click();
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
                console.log(selectedFile)
                setFeedbackMessage("File dropped successfully!");
                simulateUpload();


                handleExcelFileChangeDrop(file);
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
            <div className="w-full min-h-svh p-2 lg:p-8">
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

                {feedbackMessage && (
                    <div role="alert" className="alert alert-success my-4 w-1/2">
                        <span className="flex gap-4"><FaCheck className="text-white text-xl"/>{feedbackMessage}</span>
                    </div>
                )}
                {errorMessage && (
                    <div role="alert" className="alert alert-error my-4 w-1/2">
                        <span className="flex gap-4"><FaExclamationTriangle
                            className="text-white text-xl"/>{errorMessage}</span>
                    </div>
                )}

                <div className="flex gap-8 mt-4">
                    <div className="flex gap-4">
                        <label className="input">
                            <svg className="h-[1em] opacity-50" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                                <g strokeLinejoin="round" strokeLinecap="round" strokeWidth="2.5" fill="none"
                                   stroke="currentColor">
                                    <circle cx="11" cy="11" r="8"></circle>
                                    <path d="m21 21-4.3-4.3"></path>
                                </g>
                            </svg>
                            <input
                                type="text"
                                className="grow"
                                placeholder="Search activities"
                                value={searchQuery}
                                onChange={handleSearchChange}/>
                        </label>
                    </div>


                    <form className="filter">
                        <input className="btn btn-square" type="reset" value="×" onClick={() => setSelectedType("")} />
                        {activityTypes.map((type) => (
                            <input
                                key={type.id}
                                type="radio"
                                name="frameworks"
                                value={type.id}
                                onChange={handleTypeChange}
                                className="btn btn-primary"
                                aria-label={type.type}
                            />
                        ))}
                    </form>
                </div>
                {filteredActivities.length > 0 ? (
                    <div className="w-full grid grid-cols-1 gap-4 overflow-hidden mt-6 md:grid-cols-2 lg:grid-cols-3">
                        {filteredActivities.map((activity) => (
                            <Activity
                                key={activity.id}
                                id={activity.id}
                                title={activity.name}
                                description={activity.description}
                                image={activity.image}
                                category={activity.topic}
                                type={getActivityType(activity.type_id)}
                            />
                        ))}
                    </div>
                ) : (
                    <p className="text-7xl flex justify-center items-center text-center">No activities found.</p>
                )}

            </div>

            <dialog id="excel_modal" className="modal">
                <div className="modal-box">
                    <form method="dialog">
                        <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
                    </form>
                    <h3 className="text-lg font-bold">Upload Excel File</h3>
                    <p className="py-4">Select an Excel file to upload multiple sessions at once.</p>

                    <a href="/template.xlsx" download>
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
                    <form>
                        <input
                            type="file"
                            id="file-input"
                            style={{ display: 'none' }}
                            accept=".xlsx,.xls"
                            onChange={handleExcelFileChange}
                        />
                        <button
                            className="btn btn-primary mt-4 mx-auto w-1/3 flex items-center justify-center"
                            onClick={handleExcelSubmit}
                        >
                            Submit
                        </button>
                    </form>

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
                    <form onSubmit={handleSubmit}>
                        <div>
                            <label htmlFor="name">Name</label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={newSession.name}
                                onChange={handleInputChange}
                                placeholder="Enter the session title"
                                className="input w-full h-12 bg-secondary rounded-xl"
                            />
                        </div>
                        <div className="mt-4">
                            <label htmlFor="description">Description</label>
                            <textarea
                                id="description"
                                name="description"
                                value={newSession.description}
                                onChange={handleInputChange}
                                placeholder="Enter the session description"
                                className="input w-full h-24 bg-secondary rounded-xl"
                            />
                        </div>
                        <div className="mt-4">
                            <label htmlFor="type_id" className="select w-full h-12 bg-secondary rounded-xl">
                                <span className="label">Type</span>
                                <select
                                    id="type_id"
                                    name="type_id"
                                    value={newSession.type_id}
                                    onChange={handleInputChange}
                                >
                                    {activityTypes.map((type) => (
                                        <option key={type.id} value={type.id}>
                                            {type.type}
                                        </option>
                                    ))}
                                </select>
                            </label>
                        </div>
                        <div className="flex gap-4 mt-4">
                            <div className="w-1/2">
                                <label htmlFor="date">Date</label>
                                <input
                                    type="datetime-local"
                                    id="date"
                                    name="date"
                                    value={newSession.date}
                                    onChange={handleInputChange}
                                    className="input w-full h-12 bg-secondary rounded-xl"
                                />
                            </div>
                            <div className="w-1/2">
                                <label htmlFor="duration">Duration (minutes)</label>
                                <input
                                    type="number"
                                    id="duration"
                                    name="duration"
                                    value={newSession.duration}
                                    onChange={handleInputChange}
                                    className="input w-full h-12 bg-secondary rounded-xl"
                                />
                            </div>
                        </div>
                        <div className="mt-4">
                            <label htmlFor="topic">Topic</label>
                            <input
                                type="text"
                                id="topic"
                                name="topic"
                                value={newSession.topic}
                                onChange={handleInputChange}
                                placeholder="Enter the session topic"
                                className="input w-full h-12 bg-secondary rounded-xl"
                            />
                        </div>
                        <div className="mt-4">
                            <label htmlFor="speaker">Speaker</label>
                            <input
                                type="text"
                                id="speaker"
                                name="speaker"
                                value={newSession.speaker}
                                onChange={handleInputChange}
                                placeholder="Enter the speaker's name"
                                className="input w-full h-12 bg-secondary rounded-xl"
                            />
                        </div>
                        <div className="mt-4">
                            <label htmlFor="facilitator">Facilitator</label>
                            <input
                                type="text"
                                id="facilitator"
                                name="facilitator"
                                value={newSession.facilitator}
                                onChange={handleInputChange}
                                placeholder="Enter the facilitator's name"
                                className="input w-full h-12 bg-secondary rounded-xl"
                            />
                        </div>
                        <div className="mt-4">
                            <label htmlFor="image">Image</label>
                            <input
                                type="file"
                                id="image"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="file-input w-full h-12 bg-secondary rounded-xl"
                            />
                        </div>

                        {imagePreview && (
                            <div className="mt-4">
                                <img src={imagePreview} alt="Preview" className="w-full h-32 object-cover rounded-xl" />
                            </div>
                        )}

                        {errorMessage && (
                            <div className="text-red-500 mt-4">{errorMessage}</div>
                        )}

                        <button className="btn btn-primary mt-4 w-full">Create Session</button>
                    </form>
                </div>

                <form method="dialog" className="modal-backdrop bg-opacity-10">
                    <button>close</button>
                </form>
            </dialog>

        </>
    );
}