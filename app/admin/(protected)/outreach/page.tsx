
"use client";

import { useState } from "react";
import { Loader2, Plus, Mail, Trash2 } from "lucide-react";

export default function OutreachDashboard() {
    const [activeTab, setActiveTab] = useState("leads");

    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold mb-6">Outreach Engine</h1>

            <div className="flex gap-4 mb-6 border-b pb-2">
                <button
                    className={`px-4 py-2 ${activeTab === "leads" ? "border-b-2 border-blue-500 font-bold" : ""}`}
                    onClick={() => setActiveTab("leads")}
                >
                    Leads
                </button>
                <button
                    className={`px-4 py-2 ${activeTab === "sequences" ? "border-b-2 border-blue-500 font-bold" : ""}`}
                    onClick={() => setActiveTab("sequences")}
                >
                    Sequences
                </button>
                <button
                    className={`px-4 py-2 ${activeTab === "events" ? "border-b-2 border-blue-500 font-bold" : ""}`}
                    onClick={() => setActiveTab("events")}
                >
                    Event Log
                </button>
            </div>

            {activeTab === "leads" && <LeadsTable />}
            {activeTab === "sequences" && <SequencesList />}
            {activeTab === "events" && <EventsLog />}
        </div>
    );
}

function LeadsTable() {
    return (
        <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Leads</h2>
            <p className="text-gray-500">List of leads will appear here (fetch from /api/outreach/leads)</p>
            {/* Implementation of table fetching from API would go here */}
        </div>
    );
}

function SequencesList() {
    return (
        <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Active Sequences</h2>
                <button className="bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2">
                    <Plus size={16} /> New Sequence
                </button>
            </div>
            <p className="text-gray-500">Sequences configuration (fetch from /api/outreach/sequences)</p>
        </div>
    );
}

function EventsLog() {
    return (
        <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
            <p className="text-gray-500">Email sending logs (fetch from /api/outreach/events)</p>
        </div>
    );
}
