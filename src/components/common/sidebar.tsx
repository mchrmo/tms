"use client"

import { User } from "@clerk/nextjs/server";
import { ChevronDownIcon, ClipboardCheck, Gauge, Network, Presentation, UserIcon, Users, } from "lucide-react";
import Link from "next/link";
import { Dispatch, Fragment, SetStateAction } from "react";
import { cn, isRole } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import clsx from "clsx";
import { usePathname } from "next/navigation";
import { useUser } from "@clerk/nextjs";


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
  href: string
}

export default function Sidebar({ setOpen }: { setOpen?: Dispatch<SetStateAction<boolean>> }) {

  const { user } = useUser()
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
          href: '/meetings/items',
          name: 'Hľadať bod porady'
        }
      ]
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
      submenu: [
        {
          href: '/tasks/create',
          name: 'Vytvoriť úlohu'
        },
        {
          name: "Všetky úlohy",
          href: "/tasks"
        },
        // {
        //   name: "Delegované úlohy",
        //   href: "/tasks/my"
        // }
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
          href: '/meetings/items',
          name: 'Hľadať bod porady'
        }
      ]
    },
    {
      label: "",
      name: "Organizácie",
      icon: <Network size={24} className="mr-4" />,
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
    if(href === pathname) return true
    else return false

    if (href !== '/') return pathname.startsWith(href) ? true : false
    else if (href == pathname) return true
    return false
  }

  return (
    <div className="h-full lg:w-52 bg-white rounded-md ">
      <ScrollArea className="h-full">
        <div className="md:px-4 sm:p-0 mt-5 space-y-2" >
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
                            className="mt-[-10px] mb-[-10px] p-0 font-normal"
                            collapsible
                            defaultValue="item-1"
                          >
                            <AccordionItem value="item-1" className="m-0 p-0 font-normal">
                              <AccordionTrigger className="p-0" >
                                <a key={menu.name} className="w-full flex justify-start text-base font-normal h-8 bg-background p-4 px-2 my-2 items-center rounded-md">
                                  <div className={cn("flex justify-between w-full [&[data-state=open]>svg]:rotate-180")}>
                                    <div className="flex">
                                      <div className="w-10">{menu.icon}</div>
                                      {menu.name}
                                    </div>
                                  </div>
                                </a>
                              </AccordionTrigger>
                              <AccordionContent className="ms-3">
                                {menu.submenu.map((submenu) => (
                                  <Link key={submenu.name} href={submenu.href} 
                                  onClick={() => setOpen && setOpen(false)}
                                  className={clsx(
                                    "mt-0 mb-0 px-2 flex text-md h-9 items-center rounded-md",
                                      {
                                        "bg-white hover:bg-primary hover:text-white": !isActive(submenu.href)
                                      },
                                      {
                                        "bg-primary text-white": isActive(submenu.href)
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
                                "flex text-md h-10 my-2 items-center p-4 px-2 rounded-md",
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
                        )
                    }
                  </Fragment>
                ))}
            </Fragment>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}