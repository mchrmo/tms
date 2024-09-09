"use client"

import { UserButton, useUser } from "@clerk/nextjs"
import { currentUser, User } from "@clerk/nextjs/server"
import SignOut from "./buttons/sign-out"
import { Sheet, SheetClose, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useState } from "react";
import { Menu } from "lucide-react";
import Sidebar from "./sidebar";
import { getUserRole } from "@/lib/utils";


export default function Navbar() {
  const [opened, setOpen] = useState(false)

  const {user} = useUser()
  const role = getUserRole((user as unknown) as User)
  
  
  return (
    <header className="sticky top-0 z-50 flex flex-wrap sm:justify-start sm:flex-nowrap w-full bg-white text-sm py-4 dark:border-gray-600 border-b border-gray-600">
        <nav className="max-w-full w-full mx-auto px-4 sm:flex sm:items-center sm:justify-between" aria-label="Global">
            <div className="flex items-center justify-between w-full">
                <div className="flex items-center">
                    <div className="lg:hidden">
                        <Sheet open={opened} onOpenChange={setOpen}>
                            <SheetTrigger className='mt-1'><Menu /></SheetTrigger>
                            <SheetContent aria-describedby={undefined} side={"left"} className="w-[300px] sm:w-[340px]">
                                <SheetHeader>
                                    <SheetTitle className='text-left text-2xl font-bold ml-3'>TMS</SheetTitle>
                                </SheetHeader>
                                <Sidebar setOpen={setOpen}/>
                            </SheetContent>
                        </Sheet>
                    </div>
                    <a className="flex-none text-2xl ml-4 font-semibold" href="/">TMS RUŽOMBEROK</a>
                </div>
                <div className="flex items-center">
                  <div>
                    {
                      user && <span className="text-lg">{user.firstName} {user.lastName}, {role?.name}</span>
                    }
                  </div>
                  <SignOut iconOnly></SignOut>
                </div>
            </div>
        </nav>
    </header>
  )
} 