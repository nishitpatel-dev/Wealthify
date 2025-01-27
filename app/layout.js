import Header from "@/components/Header";
import { ClerkProvider } from "@clerk/nextjs";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";
import NextTopLoader from 'nextjs-toploader';

const inter = Inter({
  subsets: ["latin"],
});

export const metadata = {
  title: "Wealthify",
  description: "Finance Platform",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`${inter.className}`}>
          <Header />
          <NextTopLoader height={5} color="linear-gradient(to bottom right, #2563eb, #7e22ce)" crawl={true} />
          <main className="min-h-screen">{children}</main>
          <Toaster richColors />
          <footer className="bg-blue-50 py-12">
            <div className="container mx-auto px-4 text-center text-gray-600">
              <p>Made with 💗 by Nishit </p>
            </div>
          </footer>
        </body>
      </html>
    </ClerkProvider>
  );
}
