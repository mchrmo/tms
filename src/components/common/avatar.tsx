import { User } from "@clerk/nextjs/server";
import { useEffect, useState } from "react";


export default function Avatar({ name }: { name?: string | null }) {

    let [initials, setInitials] = useState<string>('N') 
    useEffect(() => {
        if (name) {
            setInitials(name.split(' ').map((n) => n[0]).join(''))
        }

    }, [name])

    return (
        <div className="bg-magenta font-semibold rounded-full flex items-center  justify-center flex-1 h-10 min-w-10 max-w-10"  >
            <span>{initials}</span>
        </div>
    )
}