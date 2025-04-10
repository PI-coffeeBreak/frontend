import { Pencil, Trash2 } from "lucide-react";

export default function UserCard() {
    return (
        <div className="w-full max-w-sm mx-auto shadow-md rounded-2xl p-4 bg-secondary">
            <div className="flex items-center justify-between space-x-4">
                <div className="flex items-center space-x-4">
                    <img
                        src="/placeholder.jpg"
                        alt="User Avatar"
                        className="w-12 h-12 rounded-full"
                    />
                    <div>
                        <p className="text-lg font-semibold">Jane Doe</p>
                        <p className="text-sm text-gray-500">jane.doe@example.com</p>
                    </div>
                </div>
                <div className="flex space-x-2">
                    <button className="btn btn-outline btn-primary btn-circle">
                        <Pencil className="w-4 h-4" />
                    </button>
                    <button className="btn btn-primary btn-circle">
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}