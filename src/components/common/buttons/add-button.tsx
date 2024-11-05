import { Button, ButtonProps } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { ForwardedRef, forwardRef } from "react";

// type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement>;

interface AddButtonProps extends ButtonProps {
  children: React.ReactNode;
  className?: string;
}

const AddButton = forwardRef<HTMLButtonElement, AddButtonProps>(
  (props, forwardedRef: ForwardedRef<HTMLButtonElement>) => (
    <Button className={props?.className} {...props} ref={forwardedRef}>{props.children} <Plus className="ml-2 h-4 w-4" /> </Button>
  )
);

AddButton.displayName = 'AddButton';


export default AddButton;


