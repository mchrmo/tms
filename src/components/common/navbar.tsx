"use client"

import { UserButton, useUser } from "@clerk/nextjs"
import { currentUser, User } from "@clerk/nextjs/server"
import SignOut from "./buttons/sign-out"
import { Sheet, SheetClose, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useState } from "react";
import { Menu } from "lucide-react";
import Sidebar from "./sidebar";
import { getUserRole } from "@/lib/utils";
import { USER_ROLES_MAP } from "@/lib/models/user.model";
import Image from "next/image";
import Link from "next/link";


export default function Navbar() {
  const [opened, setOpen] = useState(false)

  const { user } = useUser()
  const role = getUserRole((user as unknown) as User)


  return (
    <div className="bg-white p-2 justify-between items-center flex shadow-sm border-b-2 fixed top-0 left-0 right-0">
      <div>
        <Link href={'/'}>
          <Image
            alt="Task Manager"
            src="/taskmanager.png"
            className=""
            width={100}
            height={200}
          />
        </Link>
      </div>
      <Sheet open={opened} onOpenChange={setOpen}>
        <SheetTrigger className='mt-1'><Menu size={28}/></SheetTrigger>
        <SheetContent side={"left"} className="w-[300px]">
          <SheetHeader>
            <SheetTitle className='text-left text-2xl font-bold ml-3'>
              <Image
                alt="Task Manager"
                src="/taskmanager.png"
                className="lg:hidden"
                width={150}
                height={200}
              />
            </SheetTitle>
          </SheetHeader>
          <Sidebar setOpen={setOpen} />
        </SheetContent>
      </Sheet>
    </div>
  )
} 