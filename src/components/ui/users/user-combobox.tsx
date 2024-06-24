import { User } from "@prisma/client";
import { Popover, PopoverTrigger } from "@radix-ui/react-popover";
import { useCallback, useState } from "react";
import { Button } from "../button";
import { cn } from "@/lib/utils";
import { Check, ChevronsUpDown } from "lucide-react";
import { PopoverContent } from "../popover";
import { Command, CommandInput, CommandItem, CommandList } from "../command";

const POPOVER_WIDTH = 'w-[250px]';

export default function UserCombobox() {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<User | undefined>();


  const handleSetActive = useCallback((user: User) => {
    setSelected(user);

    // OPTIONAL: close the combobox upon selection
    setOpen(false);
  }, []);

  const displayName = selected ? selected.name : 'Select product';

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          className={cn('justify-between', POPOVER_WIDTH)}
        >
          {displayName}
    
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
    
      <PopoverContent side="bottom" className={cn('p-0', POPOVER_WIDTH)}>
        <Search selectedResult={selected} onSelectResult={handleSetActive} />
      </PopoverContent>
    </Popover>
  
  )
}



interface SearchProps {
  selectedResult?: User;
  onSelectResult: (user: User) => void;
}

export function Search({ selectedResult, onSelectResult }: SearchProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const users: User[] = [
    {name: "User", clerk_id: "id", id: 10, email: "mail", role_id: 2}
  ]

  const handleSelectResult = (user: User) => {
    onSelectResult(user);

    // OPTIONAL: reset the search query upon selection
    // setSearchQuery('');
  };

  return (
    <Command
      shouldFilter={true}
      className="h-auto rounded-lg border border-b-0 shadow-md"
    >
      <CommandInput
        value={searchQuery}
        onValueChange={setSearchQuery}
        placeholder="Search for product"
      />
      <CommandList>
        {/* TODO: these should have proper loading aria */}

        {users.map((u) => {
          return (
            <CommandItem
              key={u.id}
              onSelect={() => onSelectResult(u)}
              value={u.name}
            >
              <Check
                className={cn(
                  'mr-2 h-4 w-4',
                  selectedResult?.id === u.id ? 'opacity-100' : 'opacity-0'
                )}
              />
              {u.name}
            </CommandItem>
          );
        })}
      </CommandList>
      {/* <SearchResults
        query={searchQuery}
        selectedResult={selectedResult}
        onSelectResult={handleSelectResult}
      /> */}
    </Command>
  );
}

interface SearchResultsProps {
  query: string;
  selectedResult: SearchProps['selectedResult'];
  onSelectResult: SearchProps['onSelectResult'];
}

// function SearchResults({
//   query,
//   selectedResult,
//   onSelectResult,
// }: SearchResultsProps) {
//   const [debouncedSearchQuery] = useDebounce(query, 500);

//   const enabled = !!debouncedSearchQuery;

//   const {
//     data,
//     isLoading: isLoadingOrig,
//     isError,
//   } = useQuery<SearchResponse>({
//     queryKey: ['search', debouncedSearchQuery],
//     queryFn: () => searchProductsByName(debouncedSearchQuery),
//     enabled,
//   });

//   // To get around this https://github.com/TanStack/query/issues/3584
//   const isLoading = enabled && isLoadingOrig;

//   if (!enabled) return null;

//   return (
//     <CommandList>
//       {/* TODO: these should have proper loading aria */}
//       {isLoading && <div className="p-4 text-sm">Searching...</div>}
//       {!isError && !isLoading && !data?.products.length && (
//         <div className="p-4 text-sm">No products found</div>
//       )}
//       {isError && <div className="p-4 text-sm">Something went wrong</div>}

//       {data?.products.map(({ id, title }) => {
//         return (
//           <CommandItem
//             key={id}
//             onSelect={() => onSelectResult({ id, title })}
//             value={title}
//           >
//             <Check
//               className={cn(
//                 'mr-2 h-4 w-4',
//                 selectedResult?.id === id ? 'opacity-100' : 'opacity-0'
//               )}
//             />
//             {title}
//           </CommandItem>
//         );
//       })}
//     </CommandList>
//   );
// }