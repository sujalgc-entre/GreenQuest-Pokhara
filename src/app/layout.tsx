import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { VisualEditsMessenger } from "orchids-visual-edits";
import { AuthProvider } from "@/components/AuthProvider";
import { BottomNav } from "@/components/BottomNav";
import { Toaster } from "sonner";
import { PageWrapper } from "@/components/Animations";
import { SwipeNavigator } from "@/components/SwipeNavigator";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "GreenQuest Pokhara",
  description: "Track your eco-actions and carbon savings in Pokhara",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground pb-24`}
      >
        <div className="mesh-gradient" />
          <AuthProvider>
            <SwipeNavigator>
              <PageWrapper>
                {children}
              </PageWrapper>
            </SwipeNavigator>
            <BottomNav />

          <Toaster position="top-center" richColors />
        </AuthProvider>
        <VisualEditsMessenger />
      </body>
    </html>
  );
}
