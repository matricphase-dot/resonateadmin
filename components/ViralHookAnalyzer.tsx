"use client";

import { useState } from 'react';
import styles from './ViralHookAnalyzer.module.css';

interface AnalysisResult {
    score: number;
    color: 'green' | 'yellow' | 'red';
    badges: string[];
    feedback: string;
    alternatives: string[];
}

export default function ViralHookAnalyzer() {
    const [hook, setHook] = useState('');
    const [result, setResult] = useState<AnalysisResult | null>(null);
    const [loading, setLoading] = useState(false);
    const [showExplanation, setShowExplanation] = useState(false);

    const handleAnalyze = async () => {
        if (!hook.trim()) return;

        setLoading(true);
        setResult(null);

        try {
            // DEMO MODE INTERCEPTION
            if (hook.toLowerCase().includes('the future of remote work')) {
                // Simulate API delay
                await new Promise(resolve => setTimeout(resolve, 1500));
                setResult({
                    score: 8,
                    color: 'green',
                    badges: ['High Impact', 'Strong Hook'],
                    feedback: 'Great use of a forward-looking statement! This triggers curiosity.',
                    alternatives: [
                        'Remote work isn\'t the future. It\'s the present.',
                        'Why 90% of companies will recall RTO mandates by 2025.',
                        'The one thing missing from your remote work strategy.'
                    ]
                });
                setLoading(false);
                return;
            }

            const res = await fetch('/api/analyze-hook', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ hook }),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || 'Failed to analyze');
            }

            const data = await res.json();
            setResult(data);
        } catch (error: any) {
            console.error(error);
            alert(error.message || 'Failed to analyze hook. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <h2 className={styles.title}>Viral Hook Engine</h2>
            <p className={styles.subtitle}>Test your opening line before you post.</p>

            <div className={styles.inputGroup}>
                <textarea
                    className={styles.textarea}
                    value={hook}
                    onChange={(e) => setHook(e.target.value)}
                    placeholder="Paste your hook here..."
                    rows={3}
                />
                <button
                    className={styles.analyzeButton}
                    onClick={handleAnalyze}
                    disabled={loading || !hook.trim()}
                >
                    {loading ? 'Analyzing...' : 'Analyze Hook'}
                </button>
            </div>

            {result && (
                <div className={styles.resultContainer}>
                    <div className={`${styles.scoreCircle} ${styles[result.color]}`}>
                        <span className={styles.scoreValue}>{result.score}</span>
                        <span className={styles.scoreLabel}>/ 10</span>
                    </div>

                    <div className={styles.badges}>
                        {result.badges.map((badge, index) => (
                            <span key={index} className={styles.badge}>
                                {badge.includes('warning') || badge.includes('Generic') ? '⚠️' : '✅'} {badge}
                            </span>
                        ))}
                    </div>

                    <div className={styles.explanationToggle}>
                        <button onClick={() => setShowExplanation(!showExplanation)}>
                            {showExplanation ? 'Hide Explanation' : 'Why this score?'}
                        </button>
                        {showExplanation && <p className={styles.feedback}>{result.feedback}</p>}
                    </div>

                    <div className={styles.alternatives}>
                        <h3>Try these instead:</h3>
                        <ul>
                            {result.alternatives.map((alt, i) => (
                                <li key={i}>{alt}</li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}
        </div>
    );
}
