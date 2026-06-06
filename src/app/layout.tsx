import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Reserve CAFM",
  description: "Reserve CAFM enterprise facility command platform",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
