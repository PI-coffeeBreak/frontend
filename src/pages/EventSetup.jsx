import {useEffect, useState} from "react";


export default function EventSetup(){
    const [step, setStep] = useState(1)

    const [timeLeft, setTimeLeft] = useState(30);

    useEffect(() => {
        if (timeLeft === 0) return;
        const interval = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
        return () => clearInterval(interval);
    }, [timeLeft]);

    return(
        <>
            <div className="flex items-center h-screen">

                <div className="w-2/5 rounded-xl mx-auto bg-secondary h-4/5 z-10 flex flex-col items-center justify-center relative">
                            <h1 className="text-5xl text-primary font-bold">Create your event</h1>
                            <form>
                                <div className="mt-8">
                                    <label htmlFor="eventname"><span className="text-red-600">*</span>Event Name</label>
                                    <input type="text" id="eventname" placeholder="Enter the name of the event" className="p-4 w-full bg-base-200 h-16 rounded-xl"/>
                                </div>
                                <div className="w-full flex gap-4 mt-4">
                                    <div className="w-1/2">
                                        <label htmlFor="eventtype" className="block"><span className="text-red-600">*</span>Event Type</label>
                                        <select id="eventtype" className="p-4 w-full bg-base-200 h-16 rounded-xl">
                                            <option disabled selected>Pick a event type</option>
                                            <option>Conference</option>
                                            <option>Exhibiton</option>
                                            <option>Corporate</option>
                                            <option>Congress</option>
                                            <option>Other</option>
                                        </select>
                                    </div>
                                    <div className="w-1/2">
                                        <label htmlFor="eventformat" className="block"><span className="text-red-600">*</span>Event Format</label>
                                        <select id="eventformat" className="p-4 w-full bg-base-200 h-16 rounded-xl">
                                            <option disabled selected>Pick a event format</option>
                                            <option>Hybrid</option>
                                            <option>In Person</option>
                                            <option>Virtual</option>
                                        </select>
                                    </div>
                                </div>
                                    <div className="flex w-full gap-4 mt-4">
                                        <div className="w-1/2">
                                            <label htmlFor="sdate" className="block"><span className="text-red-600">*</span>Start Date</label>
                                            <input type="datetime-local" id="sdate" className=" input w-full h-16 bg-base-200 rounded-xl"></input>
                                        </div>
                                        <div className="w-1/2">
                                            <label htmlFor="edate" className="block"><span className="text-red-600">*</span>End Date</label>
                                            <input type="datetime-local" id="edate" className=" input w-full h-16 bg-base-200 rounded-xl"></input>
                                        </div>
                                    </div>
                                <div className="mt-4">
                                    <label htmlFor="eventlocation"><span className="text-red-600">*</span>Event Location</label>
                                    <input type="text" id="eventlocation" placeholder="Enter the location of the event" className="p-4 w-full bg-base-200 h-16 rounded-xl"/>
                                </div>

                                <div className="mt-8">
                                    <button className="btn btn-primary w-full h-12 rounded-xl">Submit</button>
                                </div>
                            </form>
                </div>
            </div>
        </>
    );
}