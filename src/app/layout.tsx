import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PatchPilot. — Detect API Changes & Fix Code",
  description:
    "AI-powered API change detection, impact analysis, and reliable code repair.",
};
  

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col bg-[#fbfbfa] text-[#141416] antialiased">
        {children}
      </body>
    </html>
  );
}
