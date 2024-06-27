import Link from "next/link";
import { ReactNode, SVGProps } from "react";


export default function Sidebar() {


    const adminRoutes: {label: string; path: string, icon: SVGProps<SVGAElement>}[] = [
			{
				label: 'Prehľad',
				path: '/',
				icon: <svg className="w-6 h-6 text-gray-500 transition duration-75 group-hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-white" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z"></path><path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z"></path></svg>
			},
      {
          label: 'Užívatelia',
          path: '/users',
          icon: <svg className="w-6 h-6 text-gray-500 transition duration-75 group-hover:text-gray-900 dark:text-gxray-400 dark:group-hover:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
						<path fillRule="evenodd" d="M12 4a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm-2 9a4 4 0 0 0-4 4v1a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-1a4 4 0 0 0-4-4h-4Z" clipRule="evenodd"/>
					</svg>
      },
      {
        label: 'Organizácie',
        path: '/organizations',
        icon: <svg style={{transform: 'rotate(180deg)'}} className="w-6 h-6 text-gray-500 transition duration-75 group-hover:text-gray-900 dark:text-gxray-400 dark:group-hover:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
        <path d="M5 6a3 3 0 1 1 4 2.83V10a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1V8.83a3.001 3.001 0 1 1 2 0V10a3 3 0 0 1-3 3h-1v2.17a3.001 3.001 0 1 1-2 0V13h-1a3 3 0 0 1-3-3V8.83A3.001 3.001 0 0 1 5 6Z"/>
      </svg>
      
      }
    ]

    const routes = adminRoutes

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
                  <p>admin layout</p>
                </div>
              </div>
            </div>
          </div>
        </aside>
    )
}