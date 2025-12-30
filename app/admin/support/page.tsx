
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import KBManager from "./KBManager";
import { Loader2 } from "lucide-react";

export default function SupportDashboard() {
    const [activeTab, setActiveTab] = useState<'tickets' | 'kb'>('tickets');
    const [tickets, setTickets] = useState<any[]>([]);
    const [filter, setFilter] = useState("all");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (activeTab === 'tickets') {
            fetchTickets();
        }
    }, [activeTab, filter]);

    const fetchTickets = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/support/tickets?status=${filter}`);
            const data = await res.json();
            setTickets(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold mb-6">Support Engine</h1>

            <div className="flex gap-6 mb-8 border-b">
                <button
                    onClick={() => setActiveTab('tickets')}
                    className={`pb-4 px-2 font-medium ${activeTab === 'tickets' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}
                >
                    Tickets Inbox
                </button>
                <button
                    onClick={() => setActiveTab('kb')}
                    className={`pb-4 px-2 font-medium ${activeTab === 'kb' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}
                >
                    Knowledge Base
                </button>
            </div>

            {activeTab === 'kb' ? (
                <KBManager />
            ) : (
                <>
                    <div className="flex gap-2 mb-6">
                        {["all", "open", "in_progress", "resolved", "closed"].map((status) => (
                            <button
                                key={status}
                                onClick={() => setFilter(status)}
                                className={`px-4 py-2 rounded capitalize ${filter === status ? "bg-blue-600 text-white" : "bg-gray-200 hover:bg-gray-300"}`}
                            >
                                {status.replace("_", " ")}
                            </button>
                        ))}
                    </div>

                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 border-b">
                                <tr>
                                    <th className="p-4">Subject</th>
                                    <th className="p-4">User</th>
                                    <th className="p-4">Status</th>
                                    <th className="p-4">Priority</th>
                                    <th className="p-4">Date</th>
                                    <th className="p-4">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan={6} className="p-8 text-center"><Loader2 className="animate-spin inline" /> Loading...</td></tr>
                                ) : tickets.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="p-8 text-center text-gray-500">
                                            No tickets found.
                                        </td>
                                    </tr>
                                ) : (
                                    tickets.map((ticket) => (
                                        <tr key={ticket.id} className="border-b hover:bg-gray-50">
                                            <td className="p-4 font-medium">{ticket.subject}</td>
                                            <td className="p-4">{ticket.email}</td>
                                            <td className="p-4">
                                                <span className={`px-2 py-1 rounded text-xs ${ticket.status === 'open' ? 'bg-green-100 text-green-800' :
                                                    ticket.status === 'resolved' ? 'bg-gray-100 text-gray-800' : 'bg-yellow-100 text-yellow-800'
                                                    }`}>
                                                    {ticket.status.replace("_", " ")}
                                                </span>
                                            </td>
                                            <td className="p-4 capitalize">{ticket.priority}</td>
                                            <td className="p-4 text-sm text-gray-500">{new Date(ticket.createdAt).toLocaleDateString()}</td>
                                            <td className="p-4">
                                                <Link href={`/admin/support/${ticket.id}`} className="text-blue-600 hover:underline">
                                                    View
                                                </Link>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
        </div>
    );
}

