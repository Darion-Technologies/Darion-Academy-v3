import type { Metadata, Viewport } from "next";
import "./globals.css";
import { NavigationProgress } from "@/components/navigation-progress";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#09090b",
};

export const metadata: Metadata = {
  title: { default: "Darion Academy", template: "%s | Darion Academy" },
  description: "Darion Technologies internal learning workspace",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Darion Academy",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="font-sans" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <ThemeProvider>
          <TooltipProvider delayDuration={300}>
            <NavigationProgress />
            {children}
            <Toaster position="top-right" closeButton richColors />
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
