
"use client";

import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import { MessageCircle, X, Send, LifeBuoy, ChevronRight, Mail } from "lucide-react";

type Message = {
    role: 'user' | 'assistant';
    content: string;
    sources?: { title: string, type: string }[];
};

export default function SupportWidget() {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);
    // ...

    // Hide on admin pages and landing page (root)
    if (pathname?.startsWith('/admin') || pathname === '/') {
        return null;
    }

    const [view, setView] = useState<'home' | 'chat' | 'ticket' | 'success'>('home');
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState("");
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Ticket Form
    const [ticketSubject, setTicketSubject] = useState("");
    const [ticketMessage, setTicketMessage] = useState("");
    const [savedEmail, setSavedEmail] = useState(""); // Ideally from User Context

    const quickQuestions = [
        "How does pricing work?",
        "How to generate LinkedIn posts?",
        "What to do if generation fails?",
    ];

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, view]);

    const handleSendMessage = async (text: string) => {
        if (!text.trim()) return;

        const newMessages: Message[] = [...messages, { role: 'user', content: text }];
        setMessages(newMessages);
        setInputValue("");
        setLoading(true);
        setView('chat');

        try {
            const res = await fetch('/api/support/ask', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ question: text }),
            });
            const data = await res.json();

            setMessages(prev => [
                ...prev,
                {
                    role: 'assistant',
                    content: data.answer || "I'm having trouble connecting right now.",
                    sources: data.sources
                }
            ]);
        } catch (error) {
            setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, something went wrong. Please try again or contact support." }]);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitTicket = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // Mock email if not available (in real app, get from auth context)
        const email = savedEmail || "user@example.com";

        try {
            const res = await fetch('/api/support/tickets', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email,
                    subject: ticketSubject,
                    message: ticketMessage
                }),
            });

            if (res.ok) {
                setView('success');
                setTicketSubject("");
                setTicketMessage("");
            } else {
                alert("Failed to create ticket.");
            }
        } catch (e) {
            alert("Error sending ticket.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
            {/* Widget Panel */}
            {isOpen && (
                <div className="mb-4 w-[380px] h-[600px] bg-white rounded-xl shadow-2xl flex flex-col overflow-hidden border border-gray-200 animate-in slide-in-from-bottom-5 fade-in duration-300">

                    {/* Header */}
                    <div className="bg-blue-600 p-4 flex justify-between items-center text-white shrink-0">
                        <div className="flex items-center gap-2">
                            <LifeBuoy size={20} />
                            <h3 className="font-semibold">Resonate Help</h3>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="hover:bg-blue-700 p-1 rounded">
                            <X size={20} />
                        </button>
                    </div>

                    {/* Content Area */}
                    <div className="flex-1 overflow-y-auto bg-gray-50 p-4 scrollbar-thin">

                        {/* VIEW: HOME */}
                        {view === 'home' && (
                            <div className="space-y-6">
                                <div className="text-center mt-4">
                                    <h4 className="font-bold text-gray-800 text-lg">Hi there! 👋</h4>
                                    <p className="text-gray-500 text-sm">How can we help you today?</p>
                                </div>

                                <div className="space-y-2">
                                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Suggested</p>
                                    {quickQuestions.map((q, i) => (
                                        <button
                                            key={i}
                                            onClick={() => handleSendMessage(q)}
                                            className="w-full text-left p-3 bg-white border border-gray-200 rounded-lg hover:border-blue-400 hover:shadow-sm transition-all text-sm text-gray-700 flex justify-between group"
                                        >
                                            {q}
                                            <ChevronRight size={16} className="text-gray-300 group-hover:text-blue-500" />
                                        </button>
                                    ))}
                                </div>

                                <div className="pt-4 border-t">
                                    <button
                                        onClick={() => setView('ticket')}
                                        className="w-full py-3 px-4 bg-white border border-gray-200 rounded-lg text-sm text-blue-600 font-medium hover:bg-blue-50 flex justify-center items-center gap-2"
                                    >
                                        <Mail size={16} /> Contact Support
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* VIEW: CHAT */}
                        {view === 'chat' && (
                            <div className="space-y-4">
                                {messages.map((msg, i) => (
                                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[85%] p-3 rounded-lg text-sm ${msg.role === 'user'
                                            ? 'bg-blue-600 text-white rounded-br-none'
                                            : 'bg-white border text-gray-800 rounded-bl-none shadow-sm'
                                            }`}>
                                            <div className="whitespace-pre-wrap">{msg.content}</div>
                                            {msg.sources && msg.sources.length > 0 && (
                                                <div className="mt-2 pt-2 border-t border-gray-100 text-xs text-gray-500">
                                                    <p className="font-semibold mb-1">Sources:</p>
                                                    <ul className="list-disc pl-4 space-y-1">
                                                        {msg.sources.map((s, idx) => (
                                                            <li key={idx}>{s.title}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                                {loading && (
                                    <div className="flex justify-start">
                                        <div className="bg-white border p-3 rounded-lg rounded-bl-none shadow-sm">
                                            <div className="flex gap-1">
                                                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                                                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
                                                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
                                            </div>
                                        </div>
                                    </div>
                                )}
                                <div ref={messagesEndRef} />

                                <div className="pt-4 text-center">
                                    <button onClick={() => setView('ticket')} className="text-xs text-gray-400 hover:text-blue-600 underline">
                                        Still stuck? Contact Support
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* VIEW: TICKET FORM */}
                        {view === 'ticket' && (
                            <div className="space-y-4">
                                <button onClick={() => setView('home')} className="text-xs text-gray-500 hover:text-blue-600 flex items-center gap-1">
                                    <ArrowLeft size={12} /> Back
                                </button>
                                <h3 className="font-bold text-gray-800">Submit a Ticket</h3>
                                <form onSubmit={handleSubmitTicket} className="space-y-3">
                                    <div>
                                        <label className="text-xs font-medium text-gray-500">Email</label>
                                        <input
                                            type="email"
                                            required
                                            className="w-full p-2 border rounded text-sm"
                                            placeholder="your@email.com"
                                            value={savedEmail}
                                            onChange={e => setSavedEmail(e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-gray-500">Subject</label>
                                        <input
                                            required
                                            className="w-full p-2 border rounded text-sm"
                                            value={ticketSubject}
                                            onChange={e => setTicketSubject(e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-gray-500">Message</label>
                                        <textarea
                                            required
                                            className="w-full p-2 border rounded text-sm h-32"
                                            value={ticketMessage}
                                            onChange={e => setTicketMessage(e.target.value)}
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full py-2 bg-blue-600 text-white rounded font-medium hover:bg-blue-700 disabled:opacity-50"
                                    >
                                        {loading ? 'Sending...' : 'Submit Ticket'}
                                    </button>
                                </form>
                            </div>
                        )}

                        {/* VIEW: SUCCESS */}
                        {view === 'success' && (
                            <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                                    <CheckCircle size={32} />
                                </div>
                                <h3 className="font-bold text-lg text-gray-800">Ticket Sent!</h3>
                                <p className="text-sm text-gray-600">
                                    We've received your request and will get back to you at your email address shortly.
                                </p>
                                <button
                                    onClick={() => { setView('home'); setIsOpen(false); }}
                                    className="px-6 py-2 bg-gray-900 text-white rounded hover:bg-gray-800 text-sm"
                                >
                                    Close
                                </button>
                            </div>
                        )}

                    </div>

                    {/* Chat Input (Only on Chat View) */}
                    {view === 'chat' && (
                        <div className="p-3 bg-white border-t shrink-0">
                            <form
                                onSubmit={(e) => { e.preventDefault(); handleSendMessage(inputValue); }}
                                className="flex gap-2"
                            >
                                <input
                                    className="flex-1 p-2 border rounded-full text-sm focus:outline-none focus:border-blue-500 px-4"
                                    placeholder="Type your question..."
                                    value={inputValue}
                                    onChange={e => setInputValue(e.target.value)}
                                />
                                <button
                                    type="submit"
                                    className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700"
                                    disabled={!inputValue.trim()}
                                >
                                    <Send size={18} />
                                </button>
                            </form>
                        </div>
                    )}
                    {view === 'home' && (
                        <div className="p-3 bg-white border-t shrink-0">
                            <form
                                onSubmit={(e) => { e.preventDefault(); handleSendMessage(inputValue); }}
                                className="flex gap-2"
                            >
                                <input
                                    className="flex-1 p-2 border rounded-full text-sm focus:outline-none focus:border-blue-500 px-4"
                                    placeholder="Ask anything..."
                                    value={inputValue}
                                    onChange={e => setInputValue(e.target.value)}
                                />
                                <button
                                    type="submit"
                                    className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700"
                                    disabled={!inputValue.trim()}
                                >
                                    <Send size={18} />
                                </button>
                            </form>
                        </div>
                    )}
                </div>
            )}

            {/* Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-14 h-14 bg-blue-600 rounded-full shadow-lg flex items-center justify-center text-white hover:bg-blue-700 hover:scale-105 transition-all"
            >
                {isOpen ? <X size={28} /> : <MessageCircle size={28} />}
            </button>
        </div>
    );
}

function ArrowLeft({ size }: { size: number }) {
    return <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19-7-7 7-7" /><path d="M19 12H5" /></svg>;
}

function CheckCircle({ size }: { size: number }) {
    return <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>;
}
