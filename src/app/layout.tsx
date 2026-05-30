import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tamimi Global CAFM",
  description: "Tamimi Global CAFM enterprise facility command platform",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
