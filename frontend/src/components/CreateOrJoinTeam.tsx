import { Button } from "./ui/button";
import { Link } from "react-router-dom";

export default function CreateOrJoinTeam() {
    return (
        <div className="flex overflow-hidden">
            <div className="w-3/5">
                <div className="flex items-center absolute top-10 left-20">
                    <div className="text-black font-bold text-3xl">
                        Logo
                    </div>
                </div>
                <div className="flex flex-col justify-center items-center gap-5 h-full">
                    <div className="text-3xl font-medium">
                        Do you want to create or join a team?
                    </div>
                    <div className="flex gap-28 mt-8">
                        <Button size="lg" className="rounded-3xl px-16 py-5">
                            <Link className="text-white hover:text-white text-base" to="/">
                                Create
                            </Link>
                        </Button>
                        <Button size="lg" className="rounded-3xl px-16 py-5">
                            <Link className="text-white hover:text-white text-base" to="/">
                                Join
                            </Link>
                        </Button>
                    </div>
                    <div className="text-base px-2">
                        Already have an account? <Link className="font-bold text-black underline" to="/signin">Log in</Link>
                    </div>
                </div>
            </div>
            <div className="w-2/5 h-screen bg-neutral-300"></div>

        </div>
    );
}