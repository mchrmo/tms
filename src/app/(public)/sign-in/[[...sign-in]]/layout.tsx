import Image from "next/image";

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <main className="bg-gray-50 min-h-screen grid grid-cols-5">
            <div className="min-h-screen col-span-full  lg:col-span-3 flex flex-col gap-y-20 items-center justify-center">
              <div className="text-center lg:hidden">
                  <Image
                          alt="Task Manager"
                          src="/taskmanager.png"
                          width={250}
                          height={200}
                        />              </div>
              {children}
            </div>
            <div className="min-h-screen bg-gradient-to-tr from-gradient-from to-gradient-to hidden lg:col-span-2 lg:flex items-center justify-center" >
              <div className="text-center">
                <Image
                          alt="Task Manager"
                          src="/taskmanager.png"
                          width={250}
                          height={200}
                        />
                {/* <h4 className="text-xl mt-6 font-light">Organizujeme za vás</h4> */}
              </div>
            </div>
        </main>
      );
  }
  