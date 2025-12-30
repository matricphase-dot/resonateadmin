
import MarketingDashboard from "@/components/marketing/MarketingDashboard";

export const metadata = {
    title: "Marketing Admin | Resonate",
};

export default function MarketingAdminPage() {
    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-6xl mx-auto space-y-8">
                <MarketingDashboard />
            </div>
        </div>
    );
}
