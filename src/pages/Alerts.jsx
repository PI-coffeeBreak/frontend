
import CreateCard from "../components/CreateCard.jsx";
import { HiTemplate } from "react-icons/hi";
import { BiSolidBellPlus } from "react-icons/bi";

export default function Alerts() {
    const openAlertModal = () => {
        document.getElementById('alert_modal').showModal();
    };
    return (
        <div className="w-full min-h-svh p-8">
            <h1 className="text-3xl font-bold">Create Alerts</h1>
            <div className="grid grid-cols-3 gap-4 mt-8">
                <CreateCard
                    icon={BiSolidBellPlus}
                    title="Create an alert"
                    description="Create a new alert to notify users about an upcoming event."
                    onClick={openAlertModal}
                />
                <CreateCard
                    icon={HiTemplate}
                    title="Create a Template"
                    description="Create a to send alerts more efficiently."
                    onClick={openAlertModal}
                />
            </div>

            <h1 className="text-3xl font-bold mt-8">Scheduled Alerts</h1>

            <dialog id="alert_modal" className="modal">
                <div className="modal-box">
                    <form method="dialog">
                        <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
                    </form>
                    <h3 className="text-lg font-bold">Create New Session</h3>
                    <p className="py-4">Fill in the details to create a new session.</p>
                    <form>

                        <label>Title</label>
                        <input type="text" className="input w-full h-12 bg-secondary rounded-xl"></input>
                        <label>Title</label>
                        <input type="text" className="input w-full h-12 bg-secondary rounded-xl"></input>


                    </form>
                </div>
                <form method="dialog" className="modal-backdrop bg-none bg-opacity-10">
                    <button>close</button>
                </form>
            </dialog>
        </div>
    );
}