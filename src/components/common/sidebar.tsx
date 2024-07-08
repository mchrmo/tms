"use server"

import { auth, currentUser } from "@clerk/nextjs/server";
import { ClipboardCheck, Gauge, Network, Users } from "lucide-react";
import Link from "next/link";
import { ReactNode, SVGProps, useEffect } from "react";
import SignOut from "./buttons/sign-out";
import { isRole } from "@/lib/utils";

interface RoleRoute {
  label: string; 
  path: string; 
  icon: ReactNode;
}

export default async function Sidebar() {

  const { sessionClaims } = await auth();
  

  const adminRoutes: RoleRoute[] = [
    {
      label: 'Prehľad',
      path: '/',
      icon: <Gauge />
    },
    {
      label: 'Úlohy',
      path: '/tasks',
      icon: <ClipboardCheck />
    },
    {
        label: 'Užívatelia',
        path: '/users',
        icon: <Users />
    },
    {
      label: 'Organizácie',
      path: '/organizations',
      icon: <Network />
    },
    
  ]

  const userRoutes: RoleRoute[] = [
    {
      label: 'Prehľad',
      path: '/',
      icon: <Gauge />
    },
    {
      label: 'Úlohy',
      path: '/tasks',
      icon: <ClipboardCheck />
    },
    {
      label: 'Organizácie',
      path: '/organizations',
      icon: <Network />
    }
  ]

  let routes: RoleRoute[] = []
  if(isRole(sessionClaims, 'admin')) routes = adminRoutes
  else routes = userRoutes   



  return (
      <aside id="sidebar" className="fixed top-0 left-0 z-20 flex-col flex-shrink-0 hidden w-64 h-full pt-16 font-normal duration-75 lg:flex transition-width">
        <div className="relative flex flex-col flex-1 min-h-0 pt-0 bg-white border-r border-gray-200 dark:bg-gray-800 dark:border-gray-700">
          <div className="flex flex-col flex-1 pt-5 pb-4 overflow-y-auto">
            <div className="flex-1 px-3 space-y-1 bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
              <ul className="pb-2 space-y-2">
                  {
                      routes.map(route => 
                        <li key={route.label}>
                          <Link href={route.path} className="flex items-center p-2 text-base text-gray-900 rounded-lg hover:bg-gray-100 group dark:text-gray-200 dark:hover:bg-gray-700">
                            {route.icon as ReactNode}
                            <span className="ml-3" sidebar-toggle-item="">{route.label}</span>
                          </Link>
                        </li>
    
                      )
                  }
              </ul>
              <div className="absolute bottom-0 left-0 justify-center hidden w-full p-4 space-x-4 bg-white lg:flex dark:bg-gray-800">
                <SignOut></SignOut>
              </div>
            </div>
          </div>
        </div>
      </aside>
  )
}