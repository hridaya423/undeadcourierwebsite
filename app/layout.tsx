import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Undead Courier | Post-Apocalyptic FPS",
  description: "Deliver packages. Kill zombies. Survive the apocalypse.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-black">{children}</body>
    </html>
  );
}