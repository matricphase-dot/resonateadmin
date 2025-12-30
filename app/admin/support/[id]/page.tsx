
"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, ArrowLeft, Send, CheckCircle, XCircle, Clock } from "lucide-react";

export default function TicketDetail({ params }: { params: Promise<{ id: string }> }) {
    // Unwrap params using React.use()
    const { id } = use(params);
    const router = useRouter();
    const [ticket, setTicket] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [replyMessage, setReplyMessage] = useState("");
    const [sending, setSending] = useState(false);

    useEffect(() => {
        fetchTicket();
    }, [id]);

    const fetchTicket = async () => {
        try {
            const res = await fetch(`/api/support/tickets/${id}`);
            if (!res.ok) throw new Error("Failed");
            const data = await res.json();
            setTicket(data);
        } catch (error) {
            console.error(error);
            router.push('/admin/support');
        } finally {
            setLoading(false);
        }
    };

    const handleReply = async (e: React.FormEvent) => {
        e.preventDefault();
        setSending(true);
        try {
            const res = await fetch(`/api/support/tickets/${id}/reply`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: replyMessage }),
            });
            if (!res.ok) throw new Error("Failed to send");

            setReplyMessage("");
            fetchTicket(); // Refresh timeline
        } catch (error) {
            alert("Failed to send reply");
        } finally {
            setSending(false);
        }
    };

    const updateStatus = async (status: string) => {
        await fetch(`/api/support/tickets/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status }),
        });
        fetchTicket();
    };

    if (loading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin" /></div>;
    if (!ticket) return null;

    return (
        <div className="p-8 max-w-5xl mx-auto">
            <Link href="/admin/support" className="flex items-center gap-2 text-gray-500 hover:text-blue-600 mb-6">
                <ArrowLeft size={16} /> Back to Inbox
            </Link>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h1 className="text-2xl font-bold mb-2">{ticket.subject}</h1>
                        <div className="flex gap-4 text-sm text-gray-500 mb-6">
                            <span>From: <b>{ticket.email}</b></span>
                            <span>{new Date(ticket.createdAt).toLocaleString()}</span>
                        </div>
                        <div className="prose bg-gray-50 p-4 rounded text-gray-800 whitespace-pre-wrap">
                            {ticket.message}
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow">
                        <h3 className="font-bold text-lg mb-4">Timeline</h3>
                        <div className="space-y-6">
                            {ticket.events?.map((event: any) => (
                                <div key={event.id} className="flex gap-4">
                                    <div className={`mt-1`}>
                                        {event.eventType === 'created' && <CheckCircle size={16} className="text-green-500" />}
                                        {event.eventType === 'admin_replied' && <Send size={16} className="text-blue-500" />}
                                        {event.eventType === 'status_changed' && <Clock size={16} className="text-orange-500" />}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between">
                                            <span className="font-medium text-sm capitalize">{event.eventType.replace('_', ' ')}</span>
                                            <span className="text-xs text-gray-400">{new Date(event.createdAt).toLocaleString()}</span>
                                        </div>
                                        <p className="text-gray-600 text-sm mt-1">{event.message}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow">
                        <h3 className="font-bold text-lg mb-4">Reply to User</h3>
                        <form onSubmit={handleReply}>
                            <textarea
                                className="w-full p-3 border rounded mb-4 h-32"
                                placeholder="Type your reply here..."
                                value={replyMessage}
                                onChange={e => setReplyMessage(e.target.value)}
                                required
                            />
                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    disabled={sending}
                                    className="bg-blue-600 text-white px-6 py-2 rounded flex items-center gap-2 disabled:opacity-50"
                                >
                                    {sending ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} />}
                                    Send Reply
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h3 className="font-bold text-gray-700 mb-4 uppercase text-xs tracking-wider">Status</h3>
                        <div className="space-y-2">
                            {["open", "in_progress", "resolved", "closed"].map((s) => (
                                <button
                                    key={s}
                                    onClick={() => updateStatus(s)}
                                    className={`w-full text-left px-3 py-2 rounded capitalize ${ticket.status === s ? 'bg-blue-50 text-blue-700 font-medium' : 'hover:bg-gray-50'}`}
                                >
                                    {s.replace('_', ' ')}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow">
                        <h3 className="font-bold text-gray-700 mb-4 uppercase text-xs tracking-wider">Priority</h3>
                        <div className="space-y-2">
                            {["low", "normal", "high"].map((p) => (
                                <button
                                    key={p}
                                    onClick={async () => {
                                        await fetch(`/api/support/tickets/${id}`, {
                                            method: 'PUT',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify({ priority: p }),
                                        });
                                        fetchTicket();
                                    }}
                                    className={`w-full text-left px-3 py-2 rounded capitalize ${ticket.priority === p ? 'bg-blue-50 text-blue-700 font-medium' : 'hover:bg-gray-50'}`}
                                >
                                    {p}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
