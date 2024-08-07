import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../globals.css";
import {
  ClerkProvider,
} from '@clerk/nextjs'
import { skSK } from '@clerk/localizations'
import Navbar from "@/components/common/navbar";
import Sidebar from "@/components/common/sidebar";
import { Toaster } from "@/components/ui/toaster";
import { Providers } from "../providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TMS Ružomberok",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {


  return (
    <ClerkProvider 
      localization={skSK}
      appearance={{
        elements: {
          footer: "hidden",
        }
      }}  
    >
    <html lang='en' className="">
      <Providers>
        <body className={`bg-gray-50 ${inter.className}`}>
        <Navbar/>
          <div className="flex pt-16 overflow-hidden bg-gray-50 dark:bg-gray-900 h-screen">
            <Sidebar />
            <div className="relative w-full h-full overflow-y-auto bg-gray-50 lg:ml-64 dark:bg-gray-900">
            <main>
                <div className="p-4 m-4 lg:p-8 bg-white block border-b border-gray-200 lg:mt-1.5 dark:bg-gray-800 dark:border-gray-700">
                  {children}
                </div>
            </main>
          </div>
        
          </div>
          <Toaster />
        </body>
      </Providers>
    </html>
  </ClerkProvider>
  );
}
