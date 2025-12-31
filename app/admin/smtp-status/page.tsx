export default function SmtpStatus() {
    return (
        <div className="p-8 max-w-4xl mx-auto font-sans">
            <h1 className="text-3xl font-bold mb-6">🔍 SMTP Status</h1>
            <div className="bg-gray-900 text-green-400 p-6 rounded-lg mb-8 overflow-auto">
                <h2 className="text-gray-400 text-sm mb-2">Environment Audit:</h2>
                <pre>
                    {JSON.stringify({
                        SMTP_HOST: process.env.SMTP_HOST || 'MISSING ❌',
                        SMTP_USER: process.env.SMTP_USER || 'MISSING ❌',
                        SMTP_PASS_EXISTS: !!process.env.SMTP_PASS ? 'YES ✓' : 'NO ❌',
                        NODE_ENV: process.env.NODE_ENV,
                        VERCEL_ENV: process.env.VERCEL_ENV || 'internal',
                    }, null, 2)}
                </pre>
            </div>

            <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-xl">
                <h3 className="text-xl font-bold text-yellow-800 mb-4">🚨 QUICK FIX:</h3>
                <ol className="space-y-3 list-decimal list-inside text-yellow-900">
                    <li>1. Go to **Vercel Dashboard** &rarr; Project Settings &rarr; Environment Variables</li>
                    <li>2. Ensure `SMTP_PASS` is set to `t6b3LFSMXB1P`</li>
                    <li>3. Add all other variables from `docs/VERCEL-FIX.md`</li>
                    <li>4. **Redeploy** the latest commit via "Deployments" tab</li>
                </ol>
            </div>
        </div>
    );
}
