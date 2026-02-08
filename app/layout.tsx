import type { Metadata } from "next";
import "./globals.css";
import { TamboProviderWrapper } from "@root/components/tambo/TamboProviderWrapper";

export const metadata: Metadata = {
  title: "TraceLens AI",
  description: "OSINT + Digital Forensics Investigation Dashboard using Tambo",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-[#05070d] text-white">
        <TamboProviderWrapper>
          {children}
        </TamboProviderWrapper>
      </body>
    </html>
  );
}