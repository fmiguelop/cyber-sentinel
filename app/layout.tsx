import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import "driver.js/dist/driver.css";
import "./globals.css";
const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});
export const metadata: Metadata = {
  title: "CyberSentinel - Real-Time Threat Intelligence Dashboard",
  description: "Real-time cybersecurity threat visualization dashboard",
};
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${jetbrainsMono.variable} antialiased font-mono`}>
        {children}
      </body>
    </html>
  );
}
