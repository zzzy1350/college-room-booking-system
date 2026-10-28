import type { Metadata } from "next";
import "./globals.css";
import { APP_CONFIG } from "@/lib/config";

export const metadata: Metadata = {
  title: APP_CONFIG.title,
  description: `${APP_CONFIG.rooms.map((room) => room.name).join("、")}在线预约，每日${String(APP_CONFIG.openingHour).padStart(2, "0")}:00–${String(APP_CONFIG.closingHour).padStart(2, "0")}:00开放。`,
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">{children}</body>
    </html>
  );
}
