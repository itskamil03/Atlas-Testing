import type { Metadata } from "next";
import { Libre_Baskerville } from "next/font/google";
import "./globals.css";
import "aos/dist/aos.css";
import { ThemeProvider } from "@/components/theme-provider";
import ProgressBar from "@/components/ProgressBar";
import LayoutWrapper from "@/components/LayoutWrapper";
import FooterSection from "@/components/footer";
import Providers from "@/providers/Providers";
import { BookDemoModal } from "@/components/BookDemoModal";

const libreBaskerville = Libre_Baskerville({
  subsets: ["latin"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Atlas Fintech",
    template: "%s | Atlas Fintech",
  },
  description:
    "AI-powered algo trading for Forex and Crypto with institutional-grade automation, predictive analytics, and execution algorithms.",
  icons: {
    icon: [
      { url: "/favicon.png?v=20260923", type: "image/png", sizes: "32x32" },
      { url: "/favicon.png?v=20260923", type: "image/png", sizes: "192x192" },
      { url: "/favicon.ico?v=20260923", sizes: "any" },
    ],
    shortcut: "/favicon.png?v=20260923",
    apple: [{ url: "/apple-touch-icon.png?v=20260923", sizes: "180x180" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" style={{ colorScheme: "dark" }} suppressHydrationWarning>
      <body className={`${libreBaskerville.className} antialiased overflow-x-hidden bg-background text-foreground`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          forcedTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <Providers>
            <LayoutWrapper>{children}</LayoutWrapper>
            <FooterSection />
            <ProgressBar/>
            <BookDemoModal />
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}