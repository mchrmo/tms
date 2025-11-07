import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export const shortenName = (name: string) => {
    const words = name.trim().split(' ');
    if (
        words.length === 2 &&
        words[0].length > 0 &&
        words[1].length > 0
    ) {
        const shortened = `${words[0][0]}.${words[1]}`;
        return (
            <Tooltip>
                <TooltipTrigger>{shortened}</TooltipTrigger>
                <TooltipContent>
                    <p>{name}</p>
                </TooltipContent>
            </Tooltip>
        );
    }
    return <>{name}</>;
}