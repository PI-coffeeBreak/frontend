import {NavLink} from "react-router-dom";
import {useState} from "react";

export default function Register(){
    const [step, setStep] = useState(1)



    const nextStep = () => {
        if (step < 4) setStep(step+1);
    };

    const prevStep = () => {
        if (step > 1) setStep(step-1);
    }


    return(
        <>

            <NavLink className="relative left-8 top-8" to="/">
                <button className="btn btn-primary z-20 relative rounded-xl">Go Back</button>
            </NavLink>
            <ul className="steps flex justify-center">
                <li className={`step w-16 h-16 text-lg ${step >= 1 ? "step-primary" : ""}`}></li>
                <li className={`step w-16 h-16 text-lg ${step >= 2 ? "step-primary" : ""}`}></li>
                <li className={`step w-16 h-16 text-lg ${step >= 3 ? "step-primary" : ""}`}></li>
                <li className={`step w-16 h-16 text-lg ${step >= 4 ? "step-primary" : ""}`}></li>
            </ul>
            <div className="flex items-center h-screen">

                <div className="w-2/5 rounded-xl max-w-[100dvw] mx-auto bg-secondary h-3/5 z-10 flex flex-col items-center p-8 justify-center relative">
                    {step !== 1 && (
                        <button className="absolute top-4 left-4 text-white btn btn-primary" onClick={prevStep}>
                            <i className="fa-solid fa-arrow-left"></i>
                        </button>
                    )}
                    {step === 1 &&(
                        <>
                            <h1 className="text-5xl text-primary font-bold">Welcome to coffeeBreak.</h1>
                            <p className="text-base-content text-center my-8 w-2/3">The place where you can organize the best event possible with the finest tools at your disposal.</p>
                            <input type="text" placeholder="Enter your email" className="p-4 w-full bg-base-200 h-16 rounded-xl"/>
                        </>
                    )}
                    {step === 2 &&(
                        <>
                            <div className="flex gap-4 mb-8">
                                <div>
                                    <label htmlFor="fname"><span className="text-primary">*</span>First Name</label>
                                    <input id="fname" type="text" placeholder="Enter your First Name"
                                           className="p-4 w-full bg-base-200 h-16 rounded-xl"/>
                                </div>
                                <div>
                                    <label htmlFor="lname"><span className="text-primary">*</span>Last Name</label>
                                    <input id="lname" type="text" placeholder="Enter your Last Name"
                                           className="p-4 w-full bg-base-200 h-16 rounded-xl"/>
                                </div>

                            </div>

                            <div className="w-full">
                                <label htmlFor="password"><span className="text-primary">*</span>Password</label>
                                <input id="password" type="password" placeholder="**************"
                                       className="p-4 w-full bg-base-200 h-16 rounded-xl"/>
                            </div>
                            <div className="w-full mt-8">
                                <label htmlFor="phonenumber">Phone Number</label>
                                <input id="phonenumber" type="text" placeholder="987 654 321"
                                       className="p-4 w-full bg-base-200 h-16 rounded-xl"/>
                            </div>

                            <div className="flex gap-4 justify-self-start mt-8">
                                <input type="checkbox"  className="checkbox checkbox-primary"/>
                                <p><span className="text-primary">*</span>I accept the <a><span className="text-primary font-bold hover:underline"> Terms of Use</span></a></p>
                            </div>
                            <div className="flex gap-4">
                                <input type="checkbox" className="checkbox checkbox-primary"/>
                                <p><span className="text-primary">*</span>I have read and consent to the<a><span className="text-primary font-bold hover:underline"> Privacy Policy</span></a></p>
                            </div>

                        </>
                    )}
                    {step === 3 &&(
                        <>
                            <h1 className="text-2xl">We sent a verification code to coffeebreak@aettua.pt</h1>


                        </>
                    )}
                    <button onClick={nextStep} className="w-2/3 h-10 btn btn-primary text-white mt-8 rounded-xl">Continue</button>
                    {step === 1 &&(
                        <p className="mt-4">Already have an account?<NavLink to="/login"><span className="text-primary font-bold hover:underline">Sign In</span></NavLink></p>
                    )}
                </div>
            </div>
        </>
    );
}