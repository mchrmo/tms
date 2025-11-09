import { Spinner } from "../ui/spinner";


export default function PageLoader() {
  return <div className="h-screen  flex items-center justify-center">
    <span><Spinner className="size-20 text-[#7b75f9]" /></span>
  </div>
}