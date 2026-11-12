import '@mantine/core/styles.css';
import type { Metadata } from "next";
import "./globals.css";
import { MantineProvider } from "@mantine/core";
import { theme } from "../theme";
import { AuthProvider } from "@/components/auth/AuthProvider";

export const metadata: Metadata = {
  title: "PayPilot AI — Autonomous Cashflow Copilot",
  description: "AI-powered receivables management and autonomous PayPal sandbox payments for freelancers and creators.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased bg-[#070b14]">
      <body className="min-h-full flex flex-col text-slate-100 bg-[#070b14]">
        <MantineProvider theme={theme}>
          <AuthProvider>{children}</AuthProvider>
        </MantineProvider>
      </body>
    </html>
  );
}
