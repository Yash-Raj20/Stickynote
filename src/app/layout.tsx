import type { Metadata } from "next";
import { Kalam } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Toaster } from 'react-hot-toast';

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

const kalam = Kalam({
  subsets: ['latin'],
  weight: ['300', '400', '700'],
  variable: '--font-kalam',
});

export const metadata: Metadata = {
  title: "Sticky Notes",
  description: "Keep your thoughts organized and on top.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${kalam.variable} antialiased`}
        suppressHydrationWarning
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
        >
          {children}
          <Toaster 
            position="bottom-center"
            toastOptions={{
              style: {
                background: 'var(--surface)',
                color: 'var(--foreground)',
                border: '1px solid var(--border)',
                boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                fontSize: '14px',
                fontWeight: '600',
                borderRadius: '9999px',
                padding: '8px 18px',
              },
              success: {
                style: {
                  background: '#0d9488', // Teal-600
                  color: 'white',
                  border: 'none',
                },
                iconTheme: {
                  primary: '#fef08a', // Yellow-200 badge
                  secondary: '#0d9488', // Teal-600 tick
                },
              },
              error: {
                style: {
                  background: '#ef4444', // Red-500
                  color: 'white',
                  border: 'none',
                },
                iconTheme: {
                  primary: '#fee2e2',
                  secondary: '#ef4444',
                },
              }
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
