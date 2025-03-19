import CreateCard from "../components/CreateCard.jsx";
import { HiTemplate } from "react-icons/hi";
import { BiSolidBellPlus } from "react-icons/bi";
import React, { useState } from "react";

export default function Alerts() {
    const [template, setTemplate] = useState("");
    const [templateTitle, setTemplateTitle] = useState("");
    const [templateMessage, setTemplateMessage] = useState("");

    const openAlertModal = () => {
        document.getElementById('alert_modal').showModal();
    };
    const openTemplateModal = () => {
        document.getElementById('template_modal').showModal();
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
                    description="Create a template to send alerts more efficiently."
                    onClick={openTemplateModal}
                />
            </div>
            <h1 className="text-3xl font-bold mt-8">Existing Templates</h1>

            <h1 className="text-3xl font-bold mt-8">Scheduled Alerts</h1>

            <dialog id="alert_modal" className="modal">
                <div className="modal-box">
                    <form method="dialog">
                        <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
                    </form>
                    <h3 className="text-lg font-bold">Create New Alert</h3>
                    <p className="py-4">Fill in the details to create a new alert.</p>
                    <form>
                        <div>
                            <label htmlFor="title">Title</label>
                            <input type="text" id="title" placeholder="Enter the session title" className="text-base-100 input w-full h-12 bg-secondary rounded-xl"></input>
                        </div>
                        <div className="mt-4">
                            <label htmlFor="template" className="block">Choose Template</label>
                            <select
                                id="template"
                                className="text-base-100 input w-full h-12 bg-secondary rounded-xl"
                                onChange={(e) => setTemplate(e.target.value)}
                            >
                                <option value="">Select a template</option>
                                <option value="template1">Template 1</option>
                                <option value="template2">Template 2</option>
                            </select>
                        </div>
                        {template ? (
                            <div className="mt-4">
                                <label htmlFor="templateMessage" className="block">Edit Template</label>
                                <textarea
                                    id="templateMessage"
                                    className="text-base-100 input w-full h-24 bg-secondary rounded-xl"
                                    placeholder="Edit the chosen template"
                                ></textarea>
                            </div>
                        ) : (
                            <div className="mt-4">
                                <label htmlFor="message" className="block">Message</label>
                                <textarea
                                    id="message"
                                    className="text-base-100 input w-full h-24 bg-secondary rounded-xl"
                                ></textarea>
                            </div>
                        )}
                        <div className="flex w-full gap-4 mt-4">
                            <div className="w-1/2">
                                <label htmlFor="schedulealert" className="block">Schedule Alert</label>
                                <input type="datetime-local" id="schedulealert" className="text-base-100 input w-full h-12 bg-secondary rounded-xl"></input>
                            </div>
                            <div className="w-1/2">
                                <label htmlFor="priority" className="block">Priority</label>
                                <select
                                    id="priority"
                                    className="text-base-100 input w-full h-12 bg-secondary rounded-xl"
                                >
                                    <option value="">Choose Priority</option>
                                    <option value="Low">Low</option>
                                    <option value="Medium">Medium</option>
                                    <option value="High">High</option>
                                </select>
                            </div>

                        </div>
                        <div className="mt-4">
                            <label htmlFor="who" className="block">Addressee</label>
                            <select
                                id="who"
                                className="text-base-100 input w-full h-12 bg-secondary rounded-xl"
                            >
                                <option value="">Select the Group</option>
                                <option value="Low">Everyone</option>
                                <option value="Medium">Speakers</option>
                                <option value="High">Staff</option>
                            </select>
                        </div>
                        <button className="btn btn-primary mt-4 mx-auto w-1/3 flex items-center justify-center">
                            Submit
                        </button>
                    </form>
                </div>
                <form method="dialog" className="modal-backdrop bg-none bg-opacity-10">
                    <button>close</button>
                </form>
            </dialog>
            <dialog id="template_modal" className="modal">
                <div className="modal-box">
                    <form method="dialog">
                        <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
                    </form>
                    <h3 className="text-lg font-bold">Create New Template</h3>
                    <p className="py-4">Fill in the details to create a new template.</p>
                    <form>
                        <div>
                            <label htmlFor="templateTitle">Title</label>
                            <input
                                type="text"
                                id="templateTitle"
                                placeholder="Enter template title"
                                className="text-base-100 input w-full h-12 bg-secondary rounded-xl"
                                value={templateTitle}
                                onChange={(e) => setTemplateTitle(e.target.value)}
                            />
                        </div>
                        <div className="mt-4">
                            <label htmlFor="templateMessage" className="block">Template Message</label>
                            <textarea
                                id="templateMessage"
                                className="text-base-100 input w-full h-24 bg-secondary rounded-xl"
                                value={templateMessage}
                                onChange={(e) => setTemplateMessage(e.target.value)}
                            ></textarea>
                        </div>
                        <button type="submit" className="btn btn-primary mt-4 mx-auto w-1/3 flex items-center justify-center">
                            Create Template
                        </button>
                    </form>
                </div>
                <form method="dialog" className="modal-backdrop bg-none bg-opacity-10">
                    <button>close</button>
                </form>
            </dialog>
        </div>
    );
}