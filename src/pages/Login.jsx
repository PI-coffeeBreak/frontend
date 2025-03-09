import {NavLink} from "react-router-dom";

export default function Login(){
    return(
        <>
            <NavLink className="relative left-8 top-8" to="/">
                <button className="btn btn-primary z-20 relative rounded-xl">Go Back</button>
            </NavLink>
            <div className="flex items-center h-screen">
                <div className="w-2/5 rounded-xl mx-auto bg-secondary h-2/5 z-10 flex flex-col items-center p-8 justify-center">
                    <h1 className="text-5xl text-primary font-bold">Welcome to coffeeBreak.</h1>
                    <p className="text-base-content text-center my-8 w-2/3">The place where you can organize the best event possible with the finest tools at your disposal.</p>
                    <input type="text" placeholder="Enter your email" className="p-4 w-full bg-base-200 h-16 rounded-xl"/>
                    <button className="w-2/3 h-10 btn btn-primary text-white mt-8 rounded-xl">Continue</button>
                </div>
            </div>
        </>

    );
}