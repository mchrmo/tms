"use client"

import { auth, currentUser, User } from "@clerk/nextjs/server";
import { ChevronDownIcon, ClipboardCheck, Gauge, Network, PersonStanding, Presentation, UserIcon, Users,  } from "lucide-react";
import Link from "next/link";
import { Dispatch, Fragment, ReactNode, SetStateAction, SVGProps, useEffect } from "react";
import SignOut from "./buttons/sign-out";
import { cn, isRole } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import clsx from "clsx";
import { usePathname } from "next/navigation";
import { useAuth, useUser } from "@clerk/nextjs";


type Menu = {
  label: string
  name: string
  icon: React.ReactNode
  submenu?: Submenu[]
  href: string
}

type Submenu = {
  name: string
  icon: React.ReactNode
  href: string
}

export default function Sidebar({setOpen}: {setOpen?: Dispatch<SetStateAction<boolean>>}) {

  const {user} = useUser()
  const pathname = usePathname();

  

  const adminRoutes: Menu[] = [
      {
          label: "",
          name: "Prehľad",
          icon: <Gauge size={24} className="mr-4" />,
          href: "/",
      },
      {
          label: "",
          name: "Úlohy",
          icon: <ClipboardCheck size={24} className="mr-4" />,
          href: "/tasks",
      },
      {
          label: "",
          name: "Užívatelia",
          icon: <Users size={24} className="mr-4" />,
          href: "/users",
      },
      {
        label: "",
        name: "Organizácie",
        icon: <Network size={24} className="mr-4" />,
        href: "/organizations",
      },
  ];

  const userRoutes: Menu[] = [
    {
        label: "",
        name: "Prehľad",
        icon: <Gauge size={24} className="mr-4" />,
        href: "/",
    },
    {
        label: "",
        name: "Úlohy",
        icon: <ClipboardCheck size={24} className="mr-4" />,
        href: "/tasks",
    },
    {
      label: "",
      name: "Organizácie",
      icon: <Network size={24} className="mr-4" />,
      href: "/organizations",
    },
    {
      label: "",
      name: "Porady",
      icon: <Presentation size={24} className="mr-4" />,
      href: "/meetings",
    },
    {
      label: "",
      name: "Profil",
      href: '/profile',
      icon: <UserIcon/>
    }
];

  let menus: Menu[] = []
  if(isRole((user as unknown) as User, 'admin')) menus = adminRoutes
  else menus = userRoutes   

  const uniqueLabels = Array.from(new Set(menus.map((menu) => menu.label)));

  const isActive = (href: string) => {
    if(href !== '/') return pathname.startsWith(href) ? true : false
    else if(href == pathname) return true
    return false
  }

  return (
    <ScrollArea className="h-full lg:w-52 bg-white rounded-md">
        <div className="md:px-4 sm:p-0 mt-5">
            {uniqueLabels.map((label, index) => (
                <Fragment key={label}>
                    {label && (
                        <p className={`mx-4 mb-3 text-lg text-left tracking-wider font-bold text-slate-800 ${index > 0 ? 'mt-10' : ''}`}>
                            {label}
                        </p>
                    )}
                    {menus
                        .filter((menu) => menu.label === label)
                        .map((menu) => (
                            <Fragment key={menu.name}>
                                {menu.submenu && menu.submenu.length > 0 ? (
                                    <Accordion
                                        key={menu.name}
                                        type="single"
                                        className="mt-[-10px] mb-[-10px] p-0 font-normal"
                                        collapsible
                                    >
                                        <AccordionItem value="item-1" className="m-0 p-0 font-normal">
                                            <AccordionTrigger>
                                                <a key={menu.name} className="w-full flex justify-start text-base font-normal h-10 bg-background my-2 items-center p-4 hover:bg-primary hover:text-white dark:hover:bg-primary dark:hover:text-background rounded-md">
                                                    <div className={cn("flex justify-between w-full [&[data-state=open]>svg]:rotate-180")}>
                                                        <div className="flex">
                                                            <div className="w-10">{menu.icon}</div>
                                                            {menu.name}
                                                        </div>
                                                        <ChevronDownIcon className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200" />
                                                    </div>
                                                </a>
                                            </AccordionTrigger>
                                            <AccordionContent>
                                                {menu.submenu.map((submenu) => (
                                                    <Link key={submenu.name} href={submenu.href} className="text-gray-400 mt-0 mb-0 flex text-md h-10 bg-white dark:bg-background dark:hover:bg-primary dark:hover:text-background my-2 items-center p-4 hover:bg-primary hover:text-white rounded-md">
                                                        <div className="w-6">{submenu.icon}</div>
                                                        {submenu.name}
                                                    </Link>
                                                ))}
                                            </AccordionContent>
                                        </AccordionItem>
                                    </Accordion>
                                ) : (
                                    <div key={menu.name}>
                                        <Link href={menu.href} onClick={() => setOpen && setOpen(false)} 
                                          className={clsx(
                                              "flex text-md h-10 my-2 items-center p-4 rounded-md",
                                              {
                                                "bg-white hover:bg-primary hover:text-white": !isActive(menu.href)
                                              },
                                              {
                                                "bg-primary text-white": isActive(menu.href)
                                              }
                                            )}>
                                            
                                            <div className="w-10">{menu.icon}</div>
                                            {menu.name}
                                        </Link>
                                    </div>
                                )}
                            </Fragment>
                        ))}
                </Fragment>
            ))}
        </div>
    </ScrollArea>
  );
}