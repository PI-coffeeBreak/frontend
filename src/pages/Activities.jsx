
import { FaPlus } from "react-icons/fa";
import { FaFileExcel } from "react-icons/fa6";
import CreateCard from "../components/CreateCard.jsx";

export default function Activities() {
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