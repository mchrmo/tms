export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <main className="bg-gray-50 min-h-screen grid grid-cols-5">
            <div className="min-h-screen col-span-full  lg:col-span-3 flex flex-col gap-y-20 items-center justify-center">
              <div className="text-center lg:hidden">
                  <h1 className="text-6xl font-light text-blue-500">TMS</h1>
                  <h4 className="text-xl mt-6 font-light">Organizujeme za vás...</h4>
              </div>


              {children}

            </div>
            <div className="min-h-screen bg-white hidden lg:col-span-2 lg:flex items-center justify-center" >
              <div className="text-center">
                <h1 className="text-6xl font-light text-blue-500">TMS</h1>
                <h4 className="text-xl mt-6 font-light">Organizujeme za vás</h4>
              </div>
            </div>
        </main>
      );
  }
  