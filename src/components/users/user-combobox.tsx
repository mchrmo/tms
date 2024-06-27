import { User } from "@prisma/client";
import { Popover, PopoverTrigger } from "@radix-ui/react-popover";
import { useCallback, useState } from "react";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";
import { Check, ChevronsUpDown } from "lucide-react";
import { PopoverContent } from "../ui/popover";
import { Command, CommandInput, CommandItem, CommandList } from "../ui/command";
import { useDebounce } from 'use-debounce';
import { useQuery } from '@tanstack/react-query'

const POPOVER_WIDTH = 'w-[250px]';

export default function UserCombobox({onSelectResult, mode}: {onSelectResult: (user: User) => void; mode: 'assigned' | 'unassigned'}) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<User | undefined>();


  const handleSetActive = useCallback((user: User) => {
    setSelected(user);
    onSelectResult(user)
    // OPTIONAL: close the combobox upon selection
    setOpen(false);
  }, []);

  const displayName = selected ? selected.name : 'Vybrať užívateľa';

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
        <Search selectedResult={selected} onSelectResult={handleSetActive} mode={mode} />
      </PopoverContent>
    </Popover>
  
  )
}



interface SearchProps {
  selectedResult?: User;
  onSelectResult: (user: User) => void;
  mode: 'assigned' | 'unassigned' 
}

export function Search({ selectedResult, onSelectResult, mode }: SearchProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const users: User[] = [
    {name: "User", clerk_id: "id", id: 10, email: "mail", role_id: 2}
  ]

  const handleSelectResult = (user: User) => {
    
    onSelectResult(user);
  };

  return (
    <Command
      shouldFilter={true}
      className="h-auto rounded-lg border border-b-0 shadow-md"
    >
      <CommandInput
        value={searchQuery}
        onValueChange={setSearchQuery}
        placeholder="Vyhľadať užívateľa"
      />
      <SearchResults
          query={searchQuery}
          selectedResult={selectedResult}
          onSelectResult={handleSelectResult}
          mode={mode}
        />
    </Command>
  );
}

interface SearchResultsProps {
  query: string;
  selectedResult: SearchProps['selectedResult'];
  onSelectResult: SearchProps['onSelectResult'];
  mode: 'assigned' | 'unassigned';
}

function SearchResults({
  query,
  selectedResult,
  onSelectResult,
  mode
}: SearchResultsProps) {
  const [debouncedSearchQuery] = useDebounce(query, 500);

  const enabled = !!debouncedSearchQuery;

  const getUsers = async (search: string) => {
		const res = await fetch(`/api/users/unassigned?search=${search}&mode=${mode}`);
		return res.json();
	};

  const {
    data,
    isLoading: isLoadingOrig,
    isError,
    error
  } = useQuery<User[]>({
    queryKey: ['searchUsers', debouncedSearchQuery],
    queryFn: () => getUsers(debouncedSearchQuery),
    // enabled,
  });

  // To get around this https://github.com/TanStack/query/issues/3584
  const isLoading = enabled && isLoadingOrig;



  return (
    <CommandList>
      {/* TODO: these should have proper loading aria */}
      {isLoading && <div className="p-4 text-sm">Hľadám...</div>}
      {!isError && !isLoading && !data?.length && (
        <div className="p-4 text-sm">Nenašiel sa žiadny užívateľ</div>
      )}
      {isError && <div className="p-4 text-sm">Niečo sa pokazilo...</div>}

      {data?.map((user) => {
        return (
          <CommandItem
            key={user.id}
            onSelect={() => onSelectResult(user)}
            value={user.id.toString()}
          >
            <Check
              className={cn(
                'mr-2 h-4 w-4',
                selectedResult?.id === user.id ? 'opacity-100' : 'opacity-0'
              )}
            />
            {user.name}
          </CommandItem>
        );
      })}
    </CommandList>
  );
}