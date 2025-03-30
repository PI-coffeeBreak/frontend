import React, { useState } from "react";
import Pagination from "../components/Pagination";

export default function Users() {
    const [searchTerm, setSearchTerm] = useState("");
    const [filterRole, setFilterRole] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const usersPerPage = 5;

    const users = [
        {
            id: 1,
            name: "João Almeida",
            email: "joão@ua.pt",
            role: "Organizer",
            status: "Active",
            naturality: "Portugal",
            avatar: "/joao.jpg"
        },
        {
            id: 2,
            name: "Maria Silva",
            email: "maria@ua.pt",
            role: "Staff",
            status: "Active",
            naturality: "Portugal"
        },
        {
            id: 3,
            name: "Carlos Ferreira",
            email: "carlos@ua.pt",
            role: "Staff",
            status: "Active",
            naturality: "Portugal"
        },
        {
            id: 4,
            name: "Ana Costa",
            email: "ana@ua.pt",
            role: "Staff",
            status: "Active",
            naturality: "Germany"
        },
        {
            id: 5,
            name: "Rui Machado",
            email: "rui@ua.pt",
            role: "Speaker",
            status: "Active",
            naturality: "Vizela"
        },
        {
            id: 6,
            name: "Sofia Lopes",
            email: "sofia@ua.pt",
            role: "Speaker",
            status: "Active",
            naturality: "France"
        },
        {
            id: 7,
            name: "Pedro Salgado",
            email: "pedro@ua.pt",
            role: "Speaker",
            status: "Active",
            naturality: "Germany"
        },
        {
            id: 8,
            name: "Teresa Gomes",
            email: "teresa@ua.pt",
            role: "Speaker",
            status: "Active",
            naturality: "Portugal"
        },
        {
            id: 9,
            name: "Miguel Rocha",
            email: "miguel@ua.pt",
            role: "Participant",
            status: "Active",
            naturality: "Portugal"
        },
        {
            id: 10,
            name: "Isabel Nunes",
            email: "isabel@ua.pt",
            role: "Participant",
            status: "Active",
            naturality: "Portugal"
        },
        {
            id: 11,
            name: "Ricardo Faria",
            email: "ricardo@ua.pt",
            role: "Participant",
            status: "Active",
            naturality: "Germany"
        },
        {
            id: 12,
            name: "Patrícia Sousa",
            email: "patricia@ua.pt",
            role: "Participant",
            status: "Active",
            naturality: "Italy"
        },
        {
            id: 13,
            name: "André Matos",
            email: "andre@ua.pt",
            role: "Participant",
            status: "Active",
            naturality: "Greece"
        },
        {
            id: 14,
            name: "Vanessa Ribeiro",
            email: "vanessa@ua.pt",
            role: "Participant",
            status: "Active",
            naturality: "Ucraine"
        }
    ];

    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        (filterRole === "" || user.role === filterRole)
    );

    const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
    const indexOfLastUser = currentPage * usersPerPage;
    const indexOfFirstUser = indexOfLastUser - usersPerPage;
    const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

    const handlePageChange = (pageNumber) => {
        if (pageNumber >= 1 && pageNumber <= totalPages) {
            setCurrentPage(pageNumber);
        }
    };

    return (
        <>
            <div className="w-full min-h-svh p-8">
                <h1 className="text-3xl font-bold mb-6">Users</h1>
                <div className="mb-6 flex flex-wrap gap-4 items-center">
                    <input
                        type="text"
                        placeholder="Search by name..."
                        className="p-2 border rounded-lg shadow-sm"
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <select
                        className="p-2 border rounded-lg shadow-sm"
                        onChange={(e) => setFilterRole(e.target.value)}
                    >
                        <option value="">All Roles</option>
                        <option value="Organizer">Organizer</option>
                        <option value="Staff">Staff</option>
                        <option value="Speaker">Speaker</option>
                        <option value="Participant">Participant</option>
                    </select>
                </div>

                <div className="overflow-x-auto">
                    <table className="table">
                        <thead>
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {currentUsers.map(user => (
                            <tr key={user.id}>
                                <td>
                                    <div className="flex items-center gap-3">
                                        <div className="avatar">
                                            <div className="mask mask-squircle h-12 w-12">
                                                <img
                                                    src={user.avatar ? user.avatar : "/placeholder.jpg"}
                                                    alt={`Foto de ${user.name}`}
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <div className="font-bold">{user.name}</div>
                                            <div className="text-sm opacity-50">{user.naturality}</div>
                                        </div>
                                    </div>
                                </td>
                                <td>{user.email}</td>
                                <td>
                                    <div className="badge badge-primary w-24">{user.role}</div>
                                </td>
                                <th>
                                    <button className="btn mr-2 btn-secondary btn-xs"
                                            onClick={() => document.getElementById('my_modal_3').showModal()}>Manage
                                        Role
                                    </button>
                                    <dialog id="my_modal_3" className="modal">
                                        <div className="modal-box">
                                            <form method="dialog">
                                                <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
                                            </form>
                                            <h3 className="font-bold text-lg">Hello!</h3>
                                            <p className="py-4">Press ESC key or click on ✕ button to close</p>
                                        </div>
                                    </dialog>
                                    <button className="btn btn-accent btn-xs">Ban User</button>
                                </th>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
                <Pagination 
                currentPage={currentPage} 
                totalPages={totalPages} 
                onPageChange={handlePageChange}
                />
            </div>
        </>
    );
}