import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement>;

interface AddButtonProps extends ButtonProps {
  children: React.ReactNode;
  className: string;
}


const AddButton: React.FC<AddButtonProps> = ({children, className, ...props}: {children: React.ReactNode, className: string, props?: ButtonProps}) => {

  return <Button className={className} {...props}>{children} <Plus className="ml-2 h-4 w-4" /> </Button>

}

export default AddButton;
