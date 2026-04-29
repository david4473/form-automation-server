import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Forms Automation",
  description: "Submit customer review batches and replay previous groups.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full">{children}</body>
    </html>
  );
}
