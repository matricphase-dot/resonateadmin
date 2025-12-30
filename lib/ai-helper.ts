
/**
 * Retries a function that returns a promise, with exponential backoff.
 * @param fn The function to retry.
 * @param retries Maximum number of retries.
 * @param delay Initial delay in milliseconds.
 */
export async function withRetry<T>(fn: () => Promise<T>, retries = 3, delay = 1000): Promise<T> {
    try {
        return await fn();
    } catch (error: any) {
        if (retries === 0) throw error;

        // Retry on 503 (Service Unavailable) or 429 (Too Many Requests)
        const isTransient = error.message?.includes('503') || error.message?.includes('429') || error.status === 503 || error.status === 429;

        if (isTransient) {
            console.log(`API Busy/Rate Limited. Retrying in ${delay}ms... (${retries} attempts left)`);
            await new Promise(resolve => setTimeout(resolve, delay));
            return withRetry(fn, retries - 1, delay * 2);
        }

        throw error;
    }
}
