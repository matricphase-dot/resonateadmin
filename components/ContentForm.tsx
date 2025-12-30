"use client";

import { useState } from 'react';
import styles from './ContentForm.module.css';

interface ContentFormProps {
    onGenerate: (data: any) => void;
}

export default function ContentForm({ onGenerate }: ContentFormProps) {
    const [topic, setTopic] = useState('');
    const [tone, setTone] = useState('');
    const [type, setType] = useState('Educational');
    const [length, setLength] = useState('Medium');
    const [includeHook, setIncludeHook] = useState(true);
    const [includeStory, setIncludeStory] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!topic.trim()) return;

        setIsLoading(true);
        await onGenerate({ topic, tone, type, length, includeHook, includeStory });
        setIsLoading(false);
    };

    return (
        <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.inputGroup}>
                <label htmlFor="topic" className={styles.label}>What do you want to post about?</label>
                <textarea
                    id="topic"
                    className={styles.textarea}
                    placeholder="e.g., The future of remote work..."
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    rows={3}
                />
            </div>

            <div className={styles.optionsGrid}>
                <div className={styles.selectGroup}>
                    <label className={styles.label}>Type</label>
                    <select value={type} onChange={(e) => setType(e.target.value)} className={styles.select}>
                        <option value="Educational">Educational</option>
                        <option value="Thought Leadership">Thought Leadership</option>
                        <option value="Story">Personal Story</option>
                        <option value="Contrarian">Contrarian</option>
                        <option value="Promotional">Promotional</option>
                    </select>
                </div>

                <div className={styles.selectGroup}>
                    <label className={styles.label}>Tone</label>
                    <select value={tone} onChange={(e) => setTone(e.target.value)} className={styles.select}>
                        <option value="">Auto (Use Voice Profile)</option>
                        <option value="Professional">Professional</option>
                        <option value="Casual">Casual</option>
                        <option value="Energetic">Energetic</option>
                    </select>
                </div>

                <div className={styles.selectGroup}>
                    <label className={styles.label}>Length</label>
                    <select value={length} onChange={(e) => setLength(e.target.value)} className={styles.select}>
                        <option value="Short">Short (Under 100 words)</option>
                        <option value="Medium">Medium (100-200 words)</option>
                        <option value="Long">Long (200+ words)</option>
                    </select>
                </div>
            </div>

            <div className={styles.toggles}>
                <label className={styles.toggleLabel}>
                    <input
                        type="checkbox"
                        checked={includeHook}
                        onChange={(e) => setIncludeHook(e.target.checked)}
                    />
                    Generate Viral Hook
                </label>

                <label className={styles.toggleLabel}>
                    <input
                        type="checkbox"
                        checked={includeStory}
                        onChange={(e) => setIncludeStory(e.target.checked)}
                    />
                    Include Personal Story
                </label>
            </div>

            <button type="submit" className={styles.button} disabled={isLoading || !topic.trim()}>
                {isLoading ? 'Generating...' : 'Generate Post'}
            </button>
        </form>
    );
}
