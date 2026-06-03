import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "LocateMe",
  description:
    "Smart African location sharing platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-black text-white antialiased overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}