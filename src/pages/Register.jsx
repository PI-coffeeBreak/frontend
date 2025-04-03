import {NavLink} from "react-router-dom";

export default function Register(){
    return(
        <>
            <NavLink className="relative left-8 top-8" to="/">
                <button className="btn btn-primary z-20 relative rounded-xl">Go Back</button>
            </NavLink>
            <div className="flex items-center h-screen">
                <div className="w-2/5 rounded-xl max-w-[100dvw] mx-auto bg-secondary h-4/5 z-10 flex flex-col items-center relative">
                    <h1 className="text-5xl text-primary mt-8 font-bold">Welcome to coffeeBreak.</h1>
                    <p className="text-base-content text-center my-4 mx-auto w-2/3">The place where you can organize the best event possible with the finest tools at your disposal.</p>
                    <form>
                        <div>
                            <label htmlFor="email"><span className="text-red-600">*</span>Email</label>
                            <input type="text" id="email" placeholder="Enter your email" className="p-4 w-full bg-base-200 h-16 rounded-xl"/>
                        </div>
                        <div className="w-full flex gap-4 mt-4">
                            <div className="w-1/2">
                                <label htmlFor="fname" className="block"><span className="text-red-600">*</span>First Name</label>
                                <input type="text" id="fname" placeholder="Enter your First Name" className="p-4 w-full bg-base-200 h-16 rounded-xl"/>
                            </div>
                            <div className="w-1/2">
                                <label htmlFor="lname" className="Block"><span className="text-red-600">*</span>Last Name</label>
                                <input type="text" id="lname" placeholder="Enter your Last Name" className="p-4 w-full bg-base-200 h-16 rounded-xl"/>
                            </div>
                        </div>
                        <div className="mt-4">
                            <label htmlFor="password"><span className="text-red-600">*</span>Password</label>
                            <input type="password" id="password" placeholder="**************" className="p-4 w-full bg-base-200 h-16 rounded-xl"/>
                        </div>
                        <div className="mt-4">
                            <label htmlFor="password"><span className="text-red-600">*</span>Confirm Password</label>
                            <input type="password" id="password" placeholder="**************" className="p-4 w-full bg-base-200 h-16 rounded-xl"/>
                        </div>
                        <div className="mt-4">
                            <div className="flex gap-2">
                                <input type="checkbox" className="checkbox checkbox-primary"/>
                                <p><span className="text-red-600">*</span>I accept the <span className="text-primary hover:underline hover:cursor-pointer"> Terms of Use</span></p>
                            </div>
                            <div className="flex gap-2 mt-2">
                                <input type="checkbox" className="checkbox checkbox-primary"/>
                                <p><span className="text-red-600">*</span>I have read and consent to the <span className="text-primary hover:underline hover:cursor-pointer"> Privacy Policy</span></p>
                            </div>
                        </div>
                        <div className="mt-8">
                            <button className="btn btn-primary w-full h-12 rounded-xl">Register</button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}