import { Organization } from "@prisma/client";
import { Popover, PopoverTrigger } from "@radix-ui/react-popover";
import { useCallback, useState } from "react";
import { Button } from "../button";
import { cn } from "@/lib/utils";
import { Check, ChevronsUpDown } from "lucide-react";
import { PopoverContent } from "../popover";
import { Command, CommandInput, CommandItem, CommandList } from "../command";
import { useDebounce } from 'use-debounce';
import { useQuery } from '@tanstack/react-query'

const POPOVER_WIDTH = 'w-[250px]';

export default function OrganizationCombobox({onSelectResult}: {onSelectResult: (organization: Organization) => void;}) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Organization | undefined>();


  const handleSetActive = useCallback((organization: Organization) => {
    setSelected(organization);
    onSelectResult(organization)
    // OPTIONAL: close the combobox upon selection
    setOpen(false);
  }, []);

  const displayName = selected ? selected.name : 'Vybrať organizáciu';

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
  selectedResult?: Organization;
  onSelectResult: (organization: Organization) => void;
}

export function Search({ selectedResult, onSelectResult }: SearchProps) {
  const [searchQuery, setSearchQuery] = useState('');


  const handleSelectResult = (organization: Organization) => {
    
    onSelectResult(organization);
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
        />
    </Command>
  );
}

interface SearchResultsProps {
  query: string;
  selectedResult: SearchProps['selectedResult'];
  onSelectResult: SearchProps['onSelectResult'];
}

function SearchResults({
  query,
  selectedResult,
  onSelectResult,
}: SearchResultsProps) {
  const [debouncedSearchQuery] = useDebounce(query, 500);

  const enabled = !!debouncedSearchQuery;

  const getOrganizations = async (search: string) => {
		const res = await fetch(`/api/organizations?search=${search}`);
		return res.json();
	};

  const {
    data,
    isLoading: isLoadingOrig,
    isError,
    error
  } = useQuery<Organization[]>({
    queryKey: ['searchOrganizations', debouncedSearchQuery],
    queryFn: () => getOrganizations(debouncedSearchQuery),
    // enabled,
  });

  // To get around this https://github.com/TanStack/query/issues/3584
  const isLoading = enabled && isLoadingOrig;



  return (
    <CommandList>
      {/* TODO: these should have proper loading aria */}
      {isLoading && <div className="p-4 text-sm">Hľadám...</div>}
      {!isError && !isLoading && !data?.length && (
        <div className="p-4 text-sm">Nenašla sa organizácia</div>
      )}
      {isError && <div className="p-4 text-sm">Niečo sa pokazilo...</div>}

      {data?.map((organization) => {
        return (
          <CommandItem
            key={organization.id}
            onSelect={() => onSelectResult(organization)}
            value={organization.name}
          >
            <Check
              className={cn(
                'mr-2 h-4 w-4',
                selectedResult?.id === organization.id ? 'opacity-100' : 'opacity-0'
              )}
            />
            {organization.name}
          </CommandItem>
        );
      })}
    </CommandList>
  );
}