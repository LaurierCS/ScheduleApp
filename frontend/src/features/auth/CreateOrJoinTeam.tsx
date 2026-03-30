import { Link } from "react-router-dom";

export default function CreateOrJoinTeam() {
    return (
        <div className="flex flex-col min-h-screen pt-20">
            <div className="flex-1 flex items-center justify-center px-4 py-12">
                <div className="w-full max-w-md text-center space-y-6">
                    <div>
                        <h1 className="text-4xl font-bold text-gray-900 mb-2">Create your account</h1>
                        <p className="text-gray-600">Team setup now happens during signup.</p>
                    </div>

                    <Link
                        to="/signup"
                        className="inline-flex w-full items-center justify-center rounded-lg bg-blue-600 py-2.5 text-base font-semibold text-white transition-colors hover:bg-blue-700"
                    >
                        Continue to sign up
                    </Link>

                    <p className="text-center text-sm text-gray-600">
                        Already have an account?{" "}
                        <Link to="/signin" className="text-blue-600 hover:underline font-medium">
                            Sign In
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}