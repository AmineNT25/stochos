import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import SessionProviderWrapper from "@/components/SessionProviderWrapper";
import "./globals.css";

export const metadata: Metadata = {
  title: "Stochos — Productivity Tracker",
  description: "Track your focus sessions, compete with friends, and build streaks.",
  icons: {
    icon: "/logstochos.png",
    apple: "/logstochos.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          <SessionProviderWrapper>{children}</SessionProviderWrapper>
        </ThemeProvider>
      </body>
    </html>
  );
}
