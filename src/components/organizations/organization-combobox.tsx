import { Organization } from "@prisma/client";
import { Popover, PopoverTrigger } from "@radix-ui/react-popover";
import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Check, ChevronsUpDown } from "lucide-react";
import { PopoverContent } from "@/components/ui/popover";
import { Command, CommandInput, CommandItem, CommandList, CommandSeparator } from "@/components/ui/command";
import { useDebounce } from 'use-debounce';
import { useQuery } from '@tanstack/react-query'
import { ApiError } from "next/dist/server/api-utils";

const POPOVER_WIDTH = 'w-full';

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
      shouldFilter={false}
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


  const createOrganization = async () => {

    if(query.length < 2) {
      alert("Názov musí obsahovať min. 2 znaky.")
      return
    }
    
    fetch(`/api/organizations`, {
      method: 'POST',
      body: JSON.stringify({
        name: query.trim()
      })
    }).then(res => {
      if(!res.ok) throw new Error("Nepodarilo sa vytvoriť organizáciu")

      return res.json()
    })
    .then(newOrg => onSelectResult(newOrg))
    .catch(err => alert(err.message));

  }

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

      {
        <>
          <CommandItem
              onSelect={() => createOrganization()}
            >
              Vytvoriť {query}
          </CommandItem>
          <CommandSeparator>

          </CommandSeparator>
        </>
      }

      {/* {!isError && !isLoading && !data?.length && (
        <>
          <div className="p-4 text-sm">Nenašla sa organizácia</div>
        </>
      )} */}
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