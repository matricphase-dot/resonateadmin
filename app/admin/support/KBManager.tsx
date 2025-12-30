
"use client";

import { useState, useEffect } from "react";
import { Loader2, Plus, Edit, Trash, Check, X } from "lucide-react";

export default function KBManager() {
    const [activeTab, setActiveTab] = useState<'faqs' | 'articles'>('faqs');
    const [faqs, setFaqs] = useState<any[]>([]);
    const [articles, setArticles] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [editingItem, setEditingItem] = useState<any | null>(null);

    useEffect(() => {
        fetchItems();
    }, [activeTab]);

    const fetchItems = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/support/${activeTab}`);
            const data = await res.json();
            if (activeTab === 'faqs') setFaqs(data);
            else setArticles(data);
        } catch (error) {
            console.error("Failed to fetch", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure?")) return;
        await fetch(`/api/admin/support/${activeTab}?id=${id}`, { method: 'DELETE' });
        fetchItems();
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        const method = editingItem.id ? 'PUT' : 'POST';

        await fetch(`/api/admin/support/${activeTab}`, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(editingItem),
        });

        setEditingItem(null);
        fetchItems();
    };

    return (
        <div className="space-y-6">
            <div className="flex gap-4 border-b">
                <button
                    className={`pb-2 px-1 ${activeTab === 'faqs' ? 'border-b-2 border-blue-600 font-medium' : 'text-gray-500'}`}
                    onClick={() => setActiveTab('faqs')}
                >
                    FAQs
                </button>
                <button
                    className={`pb-2 px-1 ${activeTab === 'articles' ? 'border-b-2 border-blue-600 font-medium' : 'text-gray-500'}`}
                    onClick={() => setActiveTab('articles')}
                >
                    Articles
                </button>
            </div>

            {loading ? <Loader2 className="animate-spin" /> : (
                <>
                    <button
                        onClick={() => setEditingItem(activeTab === 'faqs' ? { question: '', answerMarkdown: '', isPublished: true } : { title: '', slug: '', contentMarkdown: '', isPublished: true })}
                        className="bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2"
                    >
                        <Plus size={16} /> Add New {activeTab === 'faqs' ? 'FAQ' : 'Article'}
                    </button>

                    {editingItem && (
                        <div className="bg-gray-50 p-4 rounded border">
                            <h3 className="font-bold mb-4">{editingItem.id ? 'Edit' : 'New'} {activeTab === 'faqs' ? 'FAQ' : 'Article'}</h3>
                            <form onSubmit={handleSave} className="space-y-4">
                                {activeTab === 'faqs' ? (
                                    <>
                                        <input
                                            placeholder="Question"
                                            className="w-full p-2 border rounded"
                                            value={editingItem.question}
                                            onChange={e => setEditingItem({ ...editingItem, question: e.target.value })}
                                            required
                                        />
                                        <textarea
                                            placeholder="Answer (Markdown)"
                                            className="w-full p-2 border rounded h-32"
                                            value={editingItem.answerMarkdown}
                                            onChange={e => setEditingItem({ ...editingItem, answerMarkdown: e.target.value })}
                                            required
                                        />
                                    </>
                                ) : (
                                    <>
                                        <input
                                            placeholder="Title"
                                            className="w-full p-2 border rounded"
                                            value={editingItem.title}
                                            onChange={e => setEditingItem({ ...editingItem, title: e.target.value })}
                                            required
                                        />
                                        <input
                                            placeholder="Slug (e.g. how-to-use)"
                                            className="w-full p-2 border rounded"
                                            value={editingItem.slug}
                                            onChange={e => setEditingItem({ ...editingItem, slug: e.target.value })}
                                            required
                                        />
                                        <textarea
                                            placeholder="Content (Markdown)"
                                            className="w-full p-2 border rounded h-64"
                                            value={editingItem.contentMarkdown}
                                            onChange={e => setEditingItem({ ...editingItem, contentMarkdown: e.target.value })}
                                            required
                                        />
                                    </>
                                )}
                                <label className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={editingItem.isPublished}
                                        onChange={e => setEditingItem({ ...editingItem, isPublished: e.target.checked })}
                                    />
                                    Published
                                </label>
                                <div className="flex gap-2">
                                    <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">Save</button>
                                    <button type="button" onClick={() => setEditingItem(null)} className="bg-gray-300 px-4 py-2 rounded">Cancel</button>
                                </div>
                            </form>
                        </div>
                    )}

                    <div className="space-y-2">
                        {(activeTab === 'faqs' ? faqs : articles).map(item => (
                            <div key={item.id} className="p-4 border rounded bg-white flex justify-between items-start">
                                <div>
                                    <h4 className="font-semibold">{activeTab === 'faqs' ? item.question : item.title}</h4>
                                    <div className="text-sm text-gray-500 mt-1 line-clamp-2">
                                        {activeTab === 'faqs' ? item.answerMarkdown : item.contentMarkdown}
                                    </div>
                                    <span className={`text-xs px-2 py-0.5 rounded mt-2 inline-block ${item.isPublished ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                        {item.isPublished ? 'Published' : 'Draft'}
                                    </span>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => setEditingItem(item)} className="p-1 hover:bg-gray-100 rounded"><Edit size={16} /></button>
                                    <button onClick={() => handleDelete(item.id)} className="p-1 hover:bg-gray-100 rounded text-red-600"><Trash size={16} /></button>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
