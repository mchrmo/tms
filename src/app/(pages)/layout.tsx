import type { GetServerSideProps, Metadata } from "next";
import { Inter } from "next/font/google";
import "../globals.css";
import {
  ClerkProvider,
} from '@clerk/nextjs'
import { skSK } from '@clerk/localizations'
import Navbar from "@/components/common/navbar";
import Sidebar from "@/components/common/sidebar";
import { Toaster } from "@/components/ui/toaster";
import RoleProvider, { Providers } from "../providers";
import { auth, getAuth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import UserProvider from "../providers";
import { cloneElement } from "react";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TMS Ružomberok",
};


export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  const { userId } = auth();

  if (!userId) {
    // Handle unauthenticated access
    return <p>Please log in to access the dashboard.</p>;
  }
  // Fetch user role from your database
  const user = await prisma.user.findUnique({
    where: { clerk_id: userId },
    include: {role: true}
  });


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
        <UserProvider user={user}>
          <body className={`bg-gray-50 ${inter.className} flex flex-col min-h-screen`}>
          <Navbar/>
            <div className="flex flex-1  bg-gray-50 dark:bg-gray-900">
              <div className="hidden lg:block">
                <Sidebar />
              </div>
              <main className="w-full py-4 md:p-4 overflow-auto">
                <div className="p-4 lg:p-8 bg-white block border-b rounded-md border-gray-200 lg:mt-1.5">
                  {/* {children} */}
                  {cloneElement(children as React.ReactElement, { user })}

                </div>
              </main>
            </div>
            <Toaster />
          </body>
        </UserProvider>
      </Providers>
    </html>
  </ClerkProvider>
  );
}
