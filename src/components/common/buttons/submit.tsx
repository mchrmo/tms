import { Button } from "@/components/ui/button";
import { LoaderCircleIcon, Plus } from "lucide-react";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement>;

interface SubmitButtonProps extends ButtonProps {
  children: React.ReactNode;
  className?: string;
  isLoading?: boolean;
}


const SubmitButton: React.FC<SubmitButtonProps> = ({children, className, isLoading, ...props}: SubmitButtonProps) => {

  return <Button className={className} {...props} disabled={isLoading}>
    { isLoading && <LoaderCircleIcon className="mr-2 h-4 w-4 animate-spin" />}
    {children}
  </Button>

}

export default SubmitButton;
