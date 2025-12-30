"use client";

import { useState } from 'react';
import styles from './CommentFinder.module.css';

// Mock Data for "Trending Posts" since we don't have live LinkedIn API access
const MOCK_POSTS = [
    {
        id: 1,
        author: "Sara Blakely",
        title: "Founder, Spanx",
        content: "Failure is not the outcome - failure is not trying. Don't be afraid to fail.",
        likes: "12,453",
        comments: "452"
    },
    {
        id: 2,
        author: "Simon Sinek",
        title: "Optimist & Author",
        content: "Leadership is not about being in charge. It is about taking care of those in your charge.",
        likes: "8,921",
        comments: "312"
    },
    {
        id: 3,
        author: "Gary Vaynerchuk",
        title: "Chairman, VaynerX",
        content: "Stop worrying about what others think. The only person you need to impress is yourself in 10 years.",
        likes: "15,234",
        comments: "891"
    }
];

interface GeneratedComments {
    valueAdd: string;
    question: string;
    story: string;
}

export default function CommentFinder() {
    const [activePostId, setActivePostId] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);
    const [generatedComments, setGeneratedComments] = useState<GeneratedComments | null>(null);

    const handleGenerate = async (postId: number, postContent: string, postAuthor: string) => {
        setActivePostId(postId);
        setLoading(true);
        setGeneratedComments(null);

        try {
            const res = await fetch('/api/generate-comment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ postContent, postAuthor }),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || 'Failed to generate comments');
            }
            const data = await res.json();
            setGeneratedComments(data);
        } catch (e: any) {
            alert(e.message || 'Error generating comments');
            setActivePostId(null);
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        alert('Copied to clipboard!');
    };

    return (
        <div className={styles.container}>
            <div className={styles.inputSection}>
                <input type="text" placeholder="Enter topic to find posts (e.g. 'Marketing')..." className={styles.searchInput} />
                <button className={styles.searchButton}>Search (Simulated)</button>
            </div>

            <div className={styles.results}>
                {MOCK_POSTS.map(post => (
                    <div key={post.id} className={styles.postCard}>
                        <div className={styles.postHeader}>
                            <div className={styles.avatar}>{post.author[0]}</div>
                            <div>
                                <h4 className={styles.authorName}>{post.author}</h4>
                                <p className={styles.authorTitle}>{post.title}</p>
                            </div>
                        </div>
                        <p className={styles.postContent}>"{post.content}"</p>
                        <div className={styles.metrics}>
                            <span>👍 {post.likes}</span>
                            <span>💬 {post.comments} comments</span>
                        </div>

                        <button
                            className={styles.generateButton}
                            onClick={() => handleGenerate(post.id, post.content, post.author)}
                            disabled={loading && activePostId === post.id}
                        >
                            {loading && activePostId === post.id ? 'Thinking...' : '⚡ Generate Smart Comments'}
                        </button>

                        {activePostId === post.id && generatedComments && (
                            <div className={styles.commentsSection}>
                                <div className={styles.commentOption}>
                                    <div className={styles.optionHeader}>
                                        <span className={styles.webadge}>Value Add</span>
                                        <button onClick={() => copyToClipboard(generatedComments.valueAdd)}>Copy</button>
                                    </div>
                                    <p>{generatedComments.valueAdd}</p>
                                </div>

                                <div className={styles.commentOption}>
                                    <div className={styles.optionHeader}>
                                        <span className={styles.qbadge}>Question</span>
                                        <button onClick={() => copyToClipboard(generatedComments.question)}>Copy</button>
                                    </div>
                                    <p>{generatedComments.question}</p>
                                </div>

                                <div className={styles.commentOption}>
                                    <div className={styles.optionHeader}>
                                        <span className={styles.sbadge}>Story</span>
                                        <button onClick={() => copyToClipboard(generatedComments.story)}>Copy</button>
                                    </div>
                                    <p>{generatedComments.story}</p>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
