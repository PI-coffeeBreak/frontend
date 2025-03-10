import {NavLink} from "react-router-dom";
import divider from "daisyui/components/divider/index.js";

export default function Home(){
    return(
        <>
            <div className="mx-auto w-2/3 py-16 sm:py-28 lg:py-36">
                <div className="text-center">
                    <h1 className="text-5xl font-semibold text-balance text-primary sm:text-7xl">
                        Plan, Manage, and Elevate Your
                        Events with Ease.
                    </h1>
                    <p className="mt-8 text-lg text-pretty text-light text-base-content sm:text-xl/8">
                        coffeeBreak. makes event management easy. Plan, organize, and run events smoothly, all in one
                        place. Simple tools, smart features, and a seamless experience for great events.
                    </p>
                    <div className="mt-10 flex items-center justify-center gap-x-6">
                        <NavLink to="/signup" className="btn btn-primary rounded-xl">Get Started</NavLink>
                        <NavLink to="/about" className="text-sm/6 font-semibold text-gray-900"> Learn more <span
                            aria-hidden="true">→</span></NavLink>
                    </div>
                </div>
            </div>

            <div className="mx-auto w-2/3 py-16 sm:py-28 lg:py-36">
                <div className="text-center">
                    <p className="text-secondary text-lg font-bold ">Manage Events Effortlessly</p>
                    <h2 className="text-black text-4xl font-bold text-balance">Everything you need to plan and run your
                        event seamlessly.</h2>
                    <div className="grid grid-cols-3 gap-12 mt-12">
                        <div className="flex flex-col">
                            <h1 className="text-lg text-left text-primary font-bold">Website Dashboard</h1>
                            <p className="text-lg text-pretty text-left text-base-content">A complete platform to set
                                up, monitor, and collect data from your events.</p>
                        </div>
                        <div className="flex flex-col">
                            <h1 className="text-lg text-left text-primary font-bold">Customizable Features</h1>
                            <p className="text-lg text-pretty text-left text-base-content">A variety of additional
                                modules to tailor your event experience the way you want.</p>
                        </div>
                        <div className="flex flex-col">
                            <h1 className="text-lg text-left text-primary font-bold">Mobile App</h1>
                            <p className="text-lg text-pretty text-left text-base-content">A seamless extension of your
                                event, reflecting everything configured on the website.</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mx-auto w-2/3 py-16 sm:py-28 lg:py-36 flex">
                <h1 className="text-black text-4xl font-bold text-balance w-1/2">Want our product updates? Sign up for
                    our newsletter.</h1>
                <div className="flex-col w-1/2">
                    <div className="flex gap-2 w-full">
                        <input className="text-white w-full bg-secondary pl-4 rounded-xl" placeholder="Enter your email"/>
                        <button className="btn btn-primary rounded-xl p-4">Notify me</button>
                    </div>
                    <p>We care about your data. Read our
                        <span className="text-primary font-bold hover:underline">
                            <a href=""> privacy policy</a>
                        </span>
                    </p>
                </div>
            </div>

            <footer className="footer sm:footer-horizontal bg-secondary rounded-xl text-base-content p-10">
                <aside>
                    <img src="/giant_white_bean.svg" alt="giant white bean" width="90" height="90"/>
                    <p>
                        coffeeBreak.
                        <br/>
                        There's no event without a coffeeBreak
                    </p>
                </aside>
                <nav>
                    <h6 className="footer-title">Services</h6>
                    <a className="link link-hover">Branding</a>
                    <a className="link link-hover">Design</a>
                    <a className="link link-hover">Marketing</a>
                    <a className="link link-hover">Advertisement</a>
                </nav>
                <nav>
                    <h6 className="footer-title">Company</h6>
                    <a className="link link-hover">About us</a>
                    <a className="link link-hover">Contact</a>
                    <a className="link link-hover">Jobs</a>
                    <a className="link link-hover">Press kit</a>
                </nav>
                <nav>
                    <h6 className="footer-title">Legal</h6>
                    <a className="link link-hover">Terms of use</a>
                    <a className="link link-hover">Privacy policy</a>
                    <a className="link link-hover">Cookie policy</a>
                </nav>
            </footer>

        </>


    );
}