"use client";

import { useState } from 'react';
import styles from './ContentCalendar.module.css';

interface CalendarPost {
    id: string;
    content: string;
    type: string;
    hookScore?: number;
}

interface DaySlot {
    day: string;
    date: string;
    posts: CalendarPost[];
}

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function ContentCalendar() {
    // Mock data - in real app would sync with DB
    const [scheduled, setScheduled] = useState<DaySlot[]>(
        DAYS.map(d => ({ day: d, date: '', posts: [] }))
    );

    const [newDraft, setNewDraft] = useState('');
    const [draftType, setDraftType] = useState('Educational');

    const [unscheduled, setUnscheduled] = useState<CalendarPost[]>([
        { id: '1', content: "5 secrets to scaling your startup...", type: 'Educational', hookScore: 8.5 },
        { id: '2', content: "My biggest failure in 2024 was...", type: 'Story', hookScore: 9.2 },
        { id: '3', content: "Why I switched from React to Vue...", type: 'Contrarian', hookScore: 7.8 },
        { id: '4', content: "Join my webinar on Saturday...", type: 'Promotional', hookScore: 6.0 },
    ]);

    const handleAddDraft = () => {
        if (!newDraft.trim()) return;
        const draft: CalendarPost = {
            id: Date.now().toString(),
            content: newDraft,
            type: draftType
        };
        setUnscheduled([...unscheduled, draft]);
        setNewDraft('');
    };

    const handleDragStart = (e: React.DragEvent, post: CalendarPost, source: 'sidebar' | number) => {
        e.dataTransfer.setData('post', JSON.stringify(post));
        e.dataTransfer.setData('source', source.toString());
    };

    const handleDrop = (e: React.DragEvent, dayIndex: number) => {
        e.preventDefault();
        const post = JSON.parse(e.dataTransfer.getData('post')) as CalendarPost;
        const source = e.dataTransfer.getData('source');

        if (scheduled[dayIndex].posts.length >= 3) {
            alert("Max 3 posts per day to maintain quality!");
            return;
        }

        // Add to new slot
        const newScheduled = [...scheduled];
        newScheduled[dayIndex].posts.push(post);
        setScheduled(newScheduled);

        // Remove from source
        if (source === 'sidebar') {
            setUnscheduled(unscheduled.filter(p => p.id !== post.id));
        } else {
            const sourceDay = parseInt(source);
            // Don't duplicate if dropped in same slot
            if (sourceDay !== dayIndex) {
                newScheduled[sourceDay].posts = newScheduled[sourceDay].posts.filter(p => p.id !== post.id);
                setScheduled(newScheduled);
            }
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    const clearDay = (dayIndex: number) => {
        const postsToReturn = scheduled[dayIndex].posts;
        const newScheduled = [...scheduled];
        newScheduled[dayIndex].posts = [];
        setScheduled(newScheduled);
        setUnscheduled([...unscheduled, ...postsToReturn]);
    };

    const exportSchedule = () => {
        let text = "📅 Content Schedule:\n\n";
        scheduled.forEach(slot => {
            if (slot.posts.length > 0) {
                text += `${slot.day}:\n`;
                slot.posts.forEach(p => text += `- [${p.type}] ${p.content.substring(0, 50)}...\n`);
                text += "\n";
            }
        });
        navigator.clipboard.writeText(text);
        alert("Schedule copied to clipboard!");
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h2>Weekly Planner</h2>
                <button className={styles.exportButton} onClick={exportSchedule}>Export Text</button>
            </div>

            <div className={styles.layout}>
                {/* Sidebar */}
                <div className={styles.sidebar}>
                    <div className={styles.addDraftSection}>
                        <h3>Add New Idea</h3>
                        <textarea
                            value={newDraft}
                            onChange={(e) => setNewDraft(e.target.value)}
                            placeholder="Type your post idea..."
                            className={styles.addInput}
                        />
                        <div className={styles.addControls}>
                            <select value={draftType} onChange={(e) => setDraftType(e.target.value)} className={styles.typeSelect}>
                                <option>Educational</option>
                                <option>Story</option>
                                <option>Contrarian</option>
                                <option>Promotional</option>
                            </select>
                            <button onClick={handleAddDraft} disabled={!newDraft.trim()} className={styles.addButton}>Add</button>
                        </div>
                    </div>

                    <h3>Unscheduled Drafts</h3>
                    <div className={styles.draftList}>
                        {unscheduled.map(post => (
                            <div
                                key={post.id}
                                className={styles.draggablePost}
                                draggable
                                onDragStart={(e) => handleDragStart(e, post, 'sidebar')}
                            >
                                <div className={styles.postType}>{post.type}</div>
                                <div className={styles.postContent}>{post.content.substring(0, 40)}...</div>
                                {post.hookScore && (
                                    <div
                                        className={styles.scoreBadge}
                                        style={{ background: post.hookScore > 8 ? '#10b981' : '#f59e0b' }}
                                    >
                                        {post.hookScore}
                                    </div>
                                )}
                            </div>
                        ))}
                        {unscheduled.length === 0 && <p className={styles.empty}>All planned!</p>}
                    </div>
                </div>

                {/* Weekly Grid */}
                <div className={styles.grid}>
                    {scheduled.map((slot, i) => (
                        <div
                            key={slot.day}
                            className={styles.daySlot}
                            onDragOver={handleDragOver}
                            onDrop={(e) => handleDrop(e, i)}
                        >
                            <div className={styles.slotHeader}>
                                <span className={styles.dayName}>{slot.day}</span>
                                {slot.posts.length > 0 && (
                                    <button className={styles.clearBtn} onClick={() => clearDay(i)}>×</button>
                                )}
                            </div>

                            <div className={styles.slotPosts}>
                                {slot.posts.map(post => (
                                    <div
                                        key={post.id}
                                        className={styles.plannedPost}
                                        draggable
                                        onDragStart={(e) => handleDragStart(e, post, i)}
                                    >
                                        <span className={styles.tinyType}>{post.type}</span>
                                        {post.content.substring(0, 30)}...
                                    </div>
                                ))}
                                {slot.posts.length === 0 && <div className={styles.placeholder}>Drop here</div>}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
