"use client"

import { User } from "@clerk/nextjs/server";
import { ChevronDownIcon, ClipboardCheck, Gauge, Network, Presentation, UserIcon, Users, } from "lucide-react";
import Link from "next/link";
import { Dispatch, Fragment, SetStateAction } from "react";
import { cn, isRole } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import clsx from "clsx";
import { usePathname, useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import Image from "next/image";

import { CheckSquareBroken, Home02, LogOut02 } from "@untitled-ui/icons-react";
import SignOut from "./buttons/sign-out";
import Avatar from "./avatar";

type Menu = {
  label: string
  name: string
  icon: React.ReactNode
  submenu?: Submenu[]
  href: string
}

type Submenu = {
  name: string
  // icon: React.ReactNode
  href: string,
  params?: string
}

export default function Sidebar({ setOpen }: { setOpen?: Dispatch<SetStateAction<boolean>> }) {

  const { user } = useUser()
  const pathname = usePathname();

  const router = useRouter();


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
      // submenu: [
      //   {
      //     href: '/users',
      //     name: 'Prehľad'
      //   },
      //   {
      //     name: "Aliasy",
      //     href: "/users/aliases"
      //   }
      // ]
    },
    {
      label: "",
      name: "Organizácie",
      icon: <Network size={24} className="mr-4" />,
      href: "/organizations",
      submenu: [
        {
          href: '/organizations/create',
          name: 'Vytvoriť organizáciu'
        },
        {
          href: '/organizations',
          name: 'Všetky organizácie'
        }
      ]
    },
    {
      label: "",
      name: "Porady",
      icon: <Presentation size={24} className="mr-4" />,
      href: "/meetings",
      submenu: [
        {
          href: '/meetings/create',
          name: 'Vytvoriť poradu'
        },
        {
          href: '/meetings',
          name: 'Všetky porady'
        },
        {
          href: '/meetings/search',
          name: 'Hľadať bod porady'
        }
      ]
    },
  ];

  const userRoutes: Menu[] = [
    {
      label: "",
      name: "Domov",
      icon: <Home02 width={20} />
      ,
      href: "/",
    },
    {
      label: "",
      name: "Úlohy",
      icon: <CheckSquareBroken width={20} />,
      href: "/tasks",
      submenu: [
        {
          href: '/tasks/create',
          name: 'Vytvoriť úlohu'
        },
        {
          name: "Nedokončené úlohy",
          href: `/tasks/unfinished?assignee_name=${user?.fullName}&status=TODO,WAITING,INPROGRESS,CHECKREQ`,
        },
        {
          name: "Delegované úlohy",
          href: `/tasks/delegated?creator_name=${user?.fullName}`,
        },
        {
          name: "Všetky úlohy",
          href: "/tasks/all",
        },
        // {
        //   name: "Dokončené úloh",
        //   href: "/tasks/archive?status=DONE",
        // }

      ]
    },
    {
      label: "",
      name: "Porady",
      icon: <Presentation size={20} />,
      href: "/meetings",
      submenu: [
        {
          href: '/meetings/create',
          name: 'Vytvoriť poradu'
        },
        {
          href: '/meetings',
          name: 'Všetky porady'
        },
        {
          href: '/meetings/search',
          name: 'Hľadať bod porady'
        }
      ]
    },
    {
      label: "",
      name: "Organizácie",
      icon: <Network size={20} />,
      href: "/organizations",
    },
    {
      label: "",
      name: "Profil",
      href: '/profile',
      icon: <UserIcon />
    }
  ];

  let menus: Menu[] = []
  if (isRole((user as unknown) as User, 'admin')) menus = adminRoutes
  else menus = userRoutes

  const uniqueLabels = Array.from(new Set(menus.map((menu) => menu.label)));

  const isActive = (href: string) => {
    if (href.split("?")[0] === pathname) return true
    else return false
  }

  return (
    <div className="lg:h-full flex flex-col min-w-60 max-w-72  bg-white rounded-md ">
      {/* Logo */}
      <div className="px-4 pt-6 hidden lg:block">
        <Image
          alt="Task Manager"
          src="/taskmanager.png"
          width={150}
          height={0}
          style={{height: "auto" }}
        />
      </div>

      <ScrollArea className="max-h-[calc(100vh-10rem)] overflow-auto">
        <div className="lg:px-4 sm:p-0 mt-5 space-y-1" >
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
                    {
                      menu.submenu && menu.submenu.length > 0 ?
                        (
                          <Accordion
                            key={menu.name}
                            type="single"
                            className="p-0 font-normal"
                            collapsible
                            defaultValue="item-1"
                          >
                            <AccordionItem value="item-1" className="m-0 p-0 font-normal">
                              <AccordionTrigger className="flex text-md items-center py-2 px-2 rounded-sm font-semibold "  >
                                <a key={menu.name} className="">
                                  <div className={cn("flex justify-between w-full [&[data-state=open]>svg]:rotate-180")}>
                                    <div className="text-gray-600">{menu.icon}</div>
                                    <span className="ms-3 ">{menu.name}</span>
                                  </div>
                                </a>
                              </AccordionTrigger>
                              <AccordionContent className="ms-4 pb-1">
                                {menu.submenu.map((submenu) => (
                                  <Link key={submenu.name} href={submenu.href}
                                    onClick={() => setOpen && setOpen(false)}
                                    // onClick={() => isActive(submenu.href) && handleRefresh(submenu.href)}
                                    className={clsx(
                                      "px-2 flex text-md h-9 items-center rounded-sm font-semibold",
                                      {
                                        "bg-white hover:bg-gray-100": !isActive(submenu.href)
                                      },
                                      {
                                        "bg-gray-100": isActive(submenu.href)
                                      }
                                    )}>
                                    {submenu.name}
                                  </Link>
                                ))}
                              </AccordionContent>
                            </AccordionItem>
                          </Accordion>
                        )
                        :
                        (
                          <div key={menu.name}>
                            <Link href={menu.href} onClick={() => setOpen && setOpen(false)}
                              className={clsx(
                                "flex text-md items-center py-2 px-2 rounded-sm font-semibold",
                                {
                                  "bg-white hover:bg-gray-100": !isActive(menu.href)
                                },
                                {
                                  "bg-gray-100": isActive(menu.href)
                                }
                              )}>
                              <div className="text-gray-600">{menu.icon}</div>
                              <span className="ms-3">{menu.name}</span>
                            </Link>
                          </div>
                        )
                    }
                  </Fragment>
                ))}
            </Fragment>
          ))}
        </div>
      </ScrollArea>

      <div className="mt-auto mb-2 pt-4 p-4 border-t-2 flex space-x-2 items-center  overflow-x-auto">
        <Avatar name={user?.fullName}></Avatar>
        <div className="flex flex-col w-full">
          <div className="flex justify-between items-center">
             <span className="font-semibold">{user?.fullName}</span>
             <SignOut></SignOut>
          </div>
          <span className="text-gray-500 text-sm">{user?.emailAddresses[0] && user?.emailAddresses[0].emailAddress}</span>
        </div>
      </div>

    </div>


  );
}