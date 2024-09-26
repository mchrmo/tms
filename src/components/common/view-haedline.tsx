import { Separator } from "@/components/ui/separator";


export default function ViewHeadline({children}: {children: React.ReactNode}) {

  return (
    <div className="">
      <h1 className="text-2xl my-3 lg:mb-8">{children}</h1>
    </div>

  )

}