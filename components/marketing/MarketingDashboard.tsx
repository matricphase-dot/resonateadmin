"use client";

import React, { useState, useEffect } from "react";
import styles from "./MarketingDashboard.module.css";
import {
    Loader2, BarChart2, Check, Save, Plus, RefreshCw,
    FileText, User, Globe, Hash, Monitor, Youtube,
    PenTool, Calendar, Send, MoreHorizontal
} from "lucide-react";
import { generateMarketingPosts } from "@/services/marketing/generator";
import { generateMarketingArticle } from "@/services/marketing/articleGenerator";

type Settings = {
    productName: string;
    productDescription: string;
    targetAudience: string;
    brandVoice: string;
    primaryWebsiteUrl: string;
    userId?: string;
    postsPerDay: number;
    enabledPlatforms: string;
    timeZone: string;
    automationConfig?: string;
};

type Post = {
    id: string;
    platform: string;
    content: string;
    status: string;
    remoteStatus?: string;
    scheduledAt: string | null;
    publishedAt: string | null;
    errorMessage: string | null;
};

export default function MarketingDashboard() {
    const [activeTab, setActiveTab] = useState<"settings" | "posts" | "analytics" | "blog">("posts");
    const [loading, setLoading] = useState(false);

    // Data
    const [settings, setSettings] = useState<Settings>({
        productName: "",
        productDescription: "",
        targetAudience: "",
        brandVoice: "",
        primaryWebsiteUrl: "",
        enabledPlatforms: '["linkedin"]',
        postsPerDay: 3,
        timeZone: "UTC",
    });
    const [posts, setPosts] = useState<Post[]>([]);
    const [analytics, setAnalytics] = useState<{ clicksByPlatform: Record<string, number>; topPosts: any[] } | null>(null);
    const [articles, setArticles] = useState<any[]>([]);

    // Blog Gen State
    const [blogTopic, setBlogTopic] = useState("");
    const [blogPlatform, setBlogPlatform] = useState("medium");
    const [generateCount, setGenerateCount] = useState(3);

    // Fetch initial data
    useEffect(() => {
        fetchSettings();
        fetchPosts();
        // Load analytics & articles immediately just to have data ready or load lazy?
        // Let's keep existing behavior: lazy load
        if (activeTab === "analytics") fetchAnalytics();
        if (activeTab === "blog") fetchArticles();
    }, [activeTab]); // Added activeTab dep to ensure data loads when switching

    const fetchSettings = async () => {
        const res = await fetch("/api/admin/marketing/settings");
        const data = await res.json();
        if (data.id) setSettings(data);
    };

    const fetchPosts = async () => {
        const res = await fetch("/api/admin/marketing/posts");
        if (res.ok) {
            const data = await res.json();
            setPosts(data);
        }
    };

    const fetchAnalytics = async () => {
        const res = await fetch("/api/admin/marketing/analytics");
        if (res.ok) {
            const data = await res.json();
            setAnalytics(data);
        }
    };

    const fetchArticles = async () => {
        const res = await fetch("/api/admin/marketing/articles");
        if (res.ok) {
            const data = await res.json();
            setArticles(data);
        }
    };

    const saveSettings = async () => {
        setLoading(true);
        try {
            await fetch("/api/admin/marketing/settings", {
                method: "POST",
                body: JSON.stringify(settings),
            });
            alert("Settings saved!");
        } catch (e) {
            alert("Error saving settings");
        } finally {
            setLoading(false);
        }
    };

    const generatePosts = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/admin/marketing/generate", {
                method: "POST",
                body: JSON.stringify({ count: generateCount }),
            });
            const data = await res.json();
            if (data.success) {
                alert(`Generated ${data.count} posts!`);
                fetchPosts();
            }
        } catch (e) {
            alert("Generation failed");
        } finally {
            setLoading(false);
        }
    };

    const generateArticle = async () => {
        if (!blogTopic) return alert("Please enter a topic");
        setLoading(true);
        try {
            const res = await fetch("/api/admin/marketing/articles", {
                method: "POST",
                body: JSON.stringify({ topic: blogTopic, platform: blogPlatform }),
            });
            const data = await res.json();
            if (data.id) {
                alert("Article generated!");
                setBlogTopic("");
                fetchArticles();
            }
        } catch (e) {
            alert("Generation failed");
        } finally {
            setLoading(false);
        }
    };

    const publishPost = async (id: string) => {
        if (!confirm("Publish this post now?")) return;
        try {
            const res = await fetch("/api/admin/marketing/publish", {
                method: "POST",
                body: JSON.stringify({ postId: id }),
            });
            if (res.ok) {
                alert("Published!");
                fetchPosts();
            } else {
                alert("Failed to publish");
            }
        } catch (e) {
            console.error(e);
        }
    };

    // Derived Stats
    const totalPosts = posts.length;
    const publishedCount = posts.filter(p => p.status === 'published' || p.status === 'posted').length;
    // Clicks we have to estimate from analytics if loaded, or just show 0
    const totalClicks = analytics ? Object.values(analytics.clicksByPlatform).reduce((a, b) => a + b, 0) : 0;

    return (
        <div>
            {/* Header Content */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Traffic & Marketing Engine</h1>
                <p className="text-gray-500 mt-1">Manage your automated content strategy for Resonate.</p>
            </div>

            {/* Stats Overview */}
            <div className={styles.statsContainer}>
                <div className={styles.statCard}>
                    <div className={styles.statInfo}>
                        <span className={styles.statLabel}>Total Posts</span>
                        <span className={styles.statValue}>{totalPosts}</span>
                    </div>
                    <div className={styles.statIcon} style={{ background: '#e0e7ff', color: '#4f46e5' }}>
                        <FileText size={20} />
                    </div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statInfo}>
                        <span className={styles.statLabel}>Published</span>
                        <span className={styles.statValue}>{publishedCount}</span>
                    </div>
                    <div className={styles.statIcon} style={{ background: '#d1fae5', color: '#059669' }}>
                        <Check size={20} />
                    </div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statInfo}>
                        <span className={styles.statLabel}>Total Clicks</span>
                        <span className={styles.statValue}>{totalClicks}</span>
                    </div>
                    <div className={styles.statIcon} style={{ background: '#fef3c7', color: '#d97706' }}>
                        <BarChart2 size={20} />
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className={styles.tabsContainer}>
                <div className={styles.tabList}>
                    <button onClick={() => setActiveTab("posts")} className={`${styles.tab} ${activeTab === "posts" ? styles.activeTab : ""}`}>
                        Posts & Generation
                    </button>
                    <button onClick={() => setActiveTab("settings")} className={`${styles.tab} ${activeTab === "settings" ? styles.activeTab : ""}`}>
                        Settings & Configuration
                    </button>
                    <button onClick={() => setActiveTab("analytics")} className={`${styles.tab} ${activeTab === "analytics" ? styles.activeTab : ""}`}>
                        Analytics
                    </button>
                    <button onClick={() => setActiveTab("blog")} className={`${styles.tab} ${activeTab === "blog" ? styles.activeTab : ""}`}>
                        Blog Content
                    </button>
                </div>
            </div>

            {/* Main Content */}

            {activeTab === "settings" && (
                <div className={styles.card}>
                    <div className={styles.settingsGrid}>
                        {/* Left Col: Product Info */}
                        <div>
                            <h3 className={styles.sectionTitle}>Product Information</h3>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Product Name</label>
                                <input className={styles.input} value={settings.productName} onChange={(e) => setSettings({ ...settings, productName: e.target.value })} />
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Description</label>
                                <textarea className={styles.textarea} rows={3} value={settings.productDescription} onChange={(e) => setSettings({ ...settings, productDescription: e.target.value })} />
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Target Audience</label>
                                <textarea className={styles.textarea} rows={2} value={settings.targetAudience} onChange={(e) => setSettings({ ...settings, targetAudience: e.target.value })} />
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Brand Voice</label>
                                <input className={styles.input} value={settings.brandVoice} onChange={(e) => setSettings({ ...settings, brandVoice: e.target.value })} />
                            </div>
                        </div>

                        {/* Right Col: Config */}
                        <div>
                            <h3 className={styles.sectionTitle}>Configuration</h3>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Primary Website URL</label>
                                <input type="url" className={styles.input} value={settings.primaryWebsiteUrl} onChange={(e) => setSettings({ ...settings, primaryWebsiteUrl: e.target.value })} />
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Posts Per Day</label>
                                <input type="number" className={styles.input} value={settings.postsPerDay} onChange={(e) => setSettings({ ...settings, postsPerDay: parseInt(e.target.value) })} />
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Active Platforms</label>
                                <div className={styles.platformsGrid}>
                                    {["linkedin", "twitter", "reddit", "youtube_script"].map(p => {
                                        const current = JSON.parse(settings.enabledPlatforms || "[]");
                                        const isChecked = current.includes(p);
                                        return (
                                            <div key={p} className={styles.platformCheckbox} onClick={() => {
                                                const newPlatforms = isChecked ? current.filter((x: string) => x !== p) : [...current, p];
                                                setSettings({ ...settings, enabledPlatforms: JSON.stringify(newPlatforms) });
                                            }}>
                                                <input type="checkbox" checked={isChecked} readOnly />
                                                <span className="capitalize text-sm">{p.replace("_", " ")}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            <hr className="my-6 border-gray-200" />

                            <h3 className={styles.sectionTitle}>Automation Settings (Make.com)</h3>
                            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 mb-4">
                                <p className="text-sm text-blue-800 mb-2">
                                    <strong>How to Automate:</strong> Create a scenario in Make.com with a Custom Webhook. Paste the URL below.
                                </p>
                                <p className="text-xs text-blue-600">
                                    Resonate will POST the content here when scheduled.
                                </p>
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.label}>Make Webhook URL</label>
                                <input
                                    className={styles.input}
                                    placeholder="https://hook.us1.make.com/..."
                                    value={JSON.parse(settings.automationConfig || '{}').webhookUrl || ''}
                                    onChange={(e) => {
                                        const current = JSON.parse(settings.automationConfig || '{}');
                                        setSettings({
                                            ...settings,
                                            automationConfig: JSON.stringify({ ...current, webhookUrl: e.target.value })
                                        });
                                    }}
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Callback Secret (Optional)</label>
                                <input
                                    type="password"
                                    className={styles.input}
                                    placeholder="Shared secret for security"
                                    value={JSON.parse(settings.automationConfig || '{}').secret || ''}
                                    onChange={(e) => {
                                        const current = JSON.parse(settings.automationConfig || '{}');
                                        setSettings({
                                            ...settings,
                                            automationConfig: JSON.stringify({ ...current, secret: e.target.value })
                                        });
                                    }}
                                />
                            </div>

                            <button onClick={saveSettings} disabled={loading} className={`${styles.btn} ${styles.btnPrimary} w-full justify-center mt-4`}>
                                {loading ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                                Save Settings
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === "posts" && (
                <>
                    {/* Generator Card */}
                    <div className={styles.generateCard}>
                        <div className={styles.generateInput}>
                            <label className={styles.label}>Generate New Content</label>
                            <p className="text-sm text-gray-500 mb-2">Create new drafts based on your current settings.</p>
                            <div className="flex gap-4 items-center">
                                <div className="w-24">
                                    <input type="number" className={styles.input} value={generateCount} onChange={(e) => setGenerateCount(parseInt(e.target.value))} min={1} max={10} />
                                </div>
                                <button onClick={generatePosts} disabled={loading} className={`${styles.btn} ${styles.btnPrimary}`}>
                                    {loading ? <Loader2 className="animate-spin" size={16} /> : <Plus size={16} />}
                                    Generate Drafts
                                </button>
                            </div>
                        </div>
                        <div className="text-right">
                            <button onClick={fetchPosts} className={`${styles.btn} ${styles.btnSecondary}`}>
                                <RefreshCw size={16} /> Refresh List
                            </button>
                        </div>
                    </div>

                    {/* Posts Table */}
                    <div className={styles.tableWrapper}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>Status</th>
                                    <th>Platform</th>
                                    <th>Content Preview</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {posts.map(post => {
                                    const isManual = ["reddit", "youtube_script"].includes(post.platform);
                                    return (
                                        <tr key={post.id}>
                                            <td>
                                                <div className="flex flex-col gap-1">
                                                    <span className={`${styles.badge} ${styles[`status-${post.status}`] || styles['status-draft']}`}>
                                                        {post.status}
                                                    </span>
                                                    {post.remoteStatus === 'sent_to_make' && (
                                                        <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full inline-block w-fit">
                                                            Sent to Make
                                                        </span>
                                                    )}
                                                    {post.remoteStatus === 'callback_failed' && (
                                                        <span className="text-[10px] bg-red-100 text-red-700 px-2 py-0.5 rounded-full inline-block w-fit">
                                                            Callback Error
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="capitalize flex items-center gap-2">
                                                {post.platform === 'linkedin' && <div className="bg-blue-100 p-1 rounded"><Monitor size={14} className="text-blue-700" /></div>}
                                                {post.platform.replace("_", " ")}
                                            </td>
                                            <td style={{ maxWidth: '400px' }}>
                                                <div className="line-clamp-2 text-gray-600">{post.content}</div>
                                            </td>
                                            <td>
                                                {post.status !== 'published' && !isManual && (
                                                    <button onClick={() => publishPost(post.id)} className="text-indigo-600 hover:text-indigo-800 text-sm font-medium flex items-center gap-1">
                                                        Publish <Send size={14} />
                                                    </button>
                                                )}
                                                {isManual && (
                                                    <span className="text-xs text-gray-400 italic">Manual Copy Required</span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                                {posts.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="text-center py-8 text-gray-400">No posts yet. Generate some above!</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </>
            )}

            {activeTab === "analytics" && (
                <div className="space-y-6">
                    {/* Re-using status container for metrics */}
                    <div className={styles.statsContainer}>
                        {analytics ? Object.entries(analytics.clicksByPlatform).map(([platform, count]) => (
                            <div key={platform} className={styles.statCard}>
                                <div className={styles.statInfo}>
                                    <span className={styles.statLabel}>{platform.toUpperCase()}</span>
                                    <span className={styles.statValue}>{count}</span>
                                </div>
                            </div>
                        )) : <div className="col-span-3 text-center py-8"><Loader2 className="animate-spin inline" /> Loading Analytics...</div>}
                    </div>

                    {analytics?.topPosts && (
                        <div className={styles.card}>
                            <h3 className={styles.sectionTitle}>Top Performing Content</h3>
                            <div className={styles.tableWrapper}>
                                <table className={styles.table}>
                                    <thead>
                                        <tr>
                                            <th>Platform</th>
                                            <th>Content</th>
                                            <th>Clicks</th>
                                            <th>Date</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {analytics.topPosts.map((post: any) => (
                                            <tr key={post.id}>
                                                <td className="capitalize">{post.platform}</td>
                                                <td><div className="line-clamp-1">{post.content}</div></td>
                                                <td className="font-bold text-indigo-600">{post.clickCount}</td>
                                                <td>{new Date(post.createdAt).toLocaleDateString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {activeTab === "blog" && (
                <div className="grid md:grid-cols-3 gap-6">
                    {/* Sidebar Generator */}
                    <div className={styles.card}>
                        <h3 className={styles.sectionTitle}>New Article</h3>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Topic / Title</label>
                            <input className={styles.input} value={blogTopic} onChange={(e) => setBlogTopic(e.target.value)} placeholder="e.g. AI in 2025" />
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Target Platform</label>
                            <select className={styles.select} value={blogPlatform} onChange={(e) => setBlogPlatform(e.target.value)}>
                                <option value="medium">Medium</option>
                                <option value="devto">Dev.to</option>
                                <option value="hashnode">Hashnode</option>
                                <option value="own_blog">Own Blog</option>
                            </select>
                        </div>
                        <button onClick={generateArticle} disabled={loading} className={`${styles.btn} ${styles.btnPrimary} w-full justify-center`}>
                            {loading ? <Loader2 className="animate-spin" size={16} /> : <PenTool size={16} />}
                            Write Article
                        </button>
                    </div>

                    {/* Content List */}
                    <div className="md:col-span-2 space-y-4">
                        {articles.map(article => (
                            <div key={article.id} className={styles.card} style={{ padding: '1.5rem', marginBottom: '0' }}>
                                <div className="flex justify-between items-start mb-2">
                                    <h4 className="font-bold text-lg">{article.title}</h4>
                                    <span className={`${styles.badge} ${article.status === 'posted' ? styles['status-published'] : styles['status-draft']}`}>
                                        {article.status}
                                    </span>
                                </div>
                                <div className="text-sm text-gray-500 mb-3 flex items-center gap-2">
                                    <Globe size={14} /> {article.platform}
                                    <span>•</span>
                                    {new Date(article.createdAt).toLocaleDateString()}
                                </div>
                                <div className="prose prose-sm max-w-none bg-gray-50 p-3 rounded text-gray-600 mb-4 line-clamp-3">
                                    {article.content}
                                </div>
                                <div className="flex justify-end gap-2">
                                    <button onClick={() => navigator.clipboard.writeText(article.content)} className={`${styles.btn} ${styles.btnSecondary} text-xs py-2 px-3`}>
                                        Copy Markdown
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
