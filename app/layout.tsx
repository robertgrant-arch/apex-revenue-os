import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "APEX — AI Revenue Operating System",
  description:
    "7 specialized AI agents that research, create, reach, qualify, and convert your ideal customers — with full compliance built in.",
  openGraph: {
    title: "APEX — AI Revenue Operating System",
    description: "AI Agents That Actually Generate Revenue",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-slate-950 text-white antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
