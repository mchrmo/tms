import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../globals.css";
import {
  ClerkProvider,
} from '@clerk/nextjs'
import { skSK } from '@clerk/localizations'
import Navbar from "@/components/common/navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Task Manager",
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
      <body className={`bg-gray-50 ${inter.className}`}>
        {
          children
        }
      </body>
    </html>
  </ClerkProvider>
  );
}
