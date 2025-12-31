import type { Metadata } from "next";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import SupportWidget from "@/components/SupportWidget";

export const metadata: Metadata = {
  title: "Resonate | AI-Powered Professional Posts",
  description: "Generate engaging, professional LinkedIn posts in seconds with our AI-powered tool. Boost your personal brand today.",
  keywords: ["LinkedIn", "Content Generator", "AI", "Professional", "Social Media"],
  openGraph: {
    title: "Resonate",
    description: "Generate engaging, professional LinkedIn posts in seconds.",
    type: "website",
  },
};
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        {children}
        <SupportWidget />
        <Analytics />
      </body>
    </html>
  );
}
