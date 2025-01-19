import type { GetServerSideProps, Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
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


const inter = Inter({ subsets: ["latin"] });
const poppins = Poppins({ weight: '500', subsets: ["latin"] });
export const metadata: Metadata = {
  title: "Task Manager",
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
          <body className={`bg-gray-50 font-poppins flex flex-col min-h-screen`}>
            <div className="lg:hidden">
              <Navbar />
            </div>
            <div className="flex flex-1 bg-gray-50 dark:bg-gray-900 h-screen">
              <div className="hidden lg:block border-r-2 shadow-lg h-screen">
                <Sidebar />
              </div>
              <main className="w-full overflow-auto bg-white px-5 py-5 pb-10 h-screen">
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
