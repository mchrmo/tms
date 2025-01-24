import type {  Metadata } from "next";
import "../globals.css";
import {
  ClerkProvider,
} from '@clerk/nextjs'
import { skSK } from '@clerk/localizations'
import Navbar from "@/components/common/navbar";
import Sidebar from "@/components/common/sidebar";
import { Toaster } from "@/components/ui/toaster";
import RoleProvider, { Providers } from "../providers";
import { auth} from "@clerk/nextjs/server";
import { Poppins } from "next/font/google";


export const metadata: Metadata = {
  title: "Task Manager",
};

const poppins = Poppins({ subsets: ['latin'], weight: ['100', '200', '300','400', '500', '600', '700', '800', '900'] });


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
          <body className={`bg-gray-50 ${poppins.className} flex flex-col min-h-screen`}>
            <div className="lg:hidden">
              <Navbar />
            </div>
            <div className="flex flex-1 bg-gray-50 dark:bg-gray-900 h-screen">
              <div className="hidden lg:block border-r-2 shadow-lg h-screen">
                <Sidebar />
              </div>
              <main className="w-full overflow-auto bg-white px-5 py-7 pb-10 h-screen">
                  {/* <div className="space-y-4 mb-5">
                    <NextBreadcrumb />
                  </div> */}
                  {children}
              </main>
            </div>
            <Toaster />
          </body>
        </Providers>
      </html>
    </ClerkProvider>
  );
}
