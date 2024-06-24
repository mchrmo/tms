import { UserButton } from "@clerk/nextjs"
import { currentUser } from "@clerk/nextjs/server"


export default async function Navbar() {
    
    const user = await currentUser()


    return (
        <nav className="fixed z-30 w-full bg-white border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700" >
            <div className="px-3 py-3 lg:px-5 lg:pl-3">
                <div className="flex items-center justify-between lg:px-3" style={{minHeight: '40px'}}>
                    <h1 className="text-3xl">TMS</h1>
                    <div>
                      <div className="flex items-center gap-5">
                        <button type="button" data-dropdown-toggle="notification-dropdown" className="p-2 text-gray-500 rounded-lg hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-700">
                          <span className="sr-only">View notifications</span>
                          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z"></path></svg>
                        </button>
                        <div className="flex gap-3">
                          {
                              user &&
                              <span className="text-lg">{user.firstName} {user.lastName}</span>
                          }
                          <UserButton></UserButton>
                        </div>
                      </div>

                    </div>
                </div>
            </div>
        </nav>
    )
} 