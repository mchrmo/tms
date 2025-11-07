import { User } from "@clerk/nextjs/server";
import { useEffect, useState } from "react";


export default function Avatar({ name, size }: { name?: string | null, size?: 'sm' | 'md' | 'lg' }) {


    const sizeClass = size === 'sm' ? 'min-h-8 w-8 text-sm' : 'min-h-10 min-w-10 text-base';
    let [initials, setInitials] = useState<string>('N') 
    useEffect(() => {
        if (name) {
            setInitials(name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase())
        }

    }, [name])

    return (
        <div className={`bg-magentaLight font-semibold rounded-full flex items-center  justify-center flex-1 ${sizeClass}`}  >
            <span>{initials}</span>
        </div>
    )
}