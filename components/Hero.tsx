import styles from './Hero.module.css';

export default function Hero() {
    return (
        <section className={styles.hero}>
            <h1 className={styles.title}>
                Elevate Your <span className={styles.highlight}>LinkedIn</span> Presence with Resonate
            </h1>
            <p className={styles.subtitle}>
                Generate engaging, professional content in seconds with AI-powered magic.
            </p>
        </section>
    );
}
