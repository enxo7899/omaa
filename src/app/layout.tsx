import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { I18nProvider } from "@/lib/i18n";
import { AppStoreProvider } from "@/lib/store";
import { Toaster } from "@/components/ui/sonner";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "OMAA · Besnikëria dhe porositë",
  description: "Demo: programi i besnikërisë dhe porositë për klientët e OMAA.",
};

export const viewport: Viewport = {
  themeColor: "#26402F",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="sq" className={`${geist.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <I18nProvider>
          <AppStoreProvider>
            {children}
            <Toaster />
          </AppStoreProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
