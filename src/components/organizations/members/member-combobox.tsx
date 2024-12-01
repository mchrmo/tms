import { Prisma, User } from "@prisma/client";
import { Popover, PopoverTrigger } from "@radix-ui/react-popover";
import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Check, ChevronsUpDown } from "lucide-react";
import { PopoverContent } from "@/components/ui/popover";
import { Command, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { useDebounce } from 'use-debounce';
import { useQuery } from '@tanstack/react-query'
import { Payload } from "@prisma/client/runtime/library";
import { useOrganizationMembers } from "@/lib/hooks/organization/organizationMember.hooks";
import { ColumnFiltersState } from "@tanstack/react-table";
import { OrganizationMemberListItem } from "@/lib/services/organizations/organizationMembers.service";

const POPOVER_WIDTH = 'w-full';


export default function OrganizationMemberCombobox({onSelectResult, label, defaultValue: _def, managersToOrg, disabled}: 
  {
    onSelectResult: (organizationMember: OrganizationMemberListItem) => void,
    label?: string
    defaultValue?: OrganizationMemberListItem
    managersToOrg?: number,
    disabled?: boolean
  }) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<OrganizationMemberListItem | undefined>(_def);


  const handleSetActive = useCallback((organizationMember: OrganizationMemberListItem) => {
    setSelected(organizationMember);
    onSelectResult(organizationMember)
    // OPTIONAL: close the combobox upon selection
    setOpen(false);
  }, []);

  const displayName = selected ? `${selected.user.name}, ${selected.position_name}` : (label ? label : 'Vybrať');

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          className={cn('justify-between', POPOVER_WIDTH)}
          disabled={disabled}
        >
          {displayName}

          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
    
      <PopoverContent side="bottom" className={cn('p-0', POPOVER_WIDTH)}>
        <Search selectedResult={selected} onSelectResult={handleSetActive} managersToOrg={managersToOrg}/>
      </PopoverContent>
    </Popover>
  
  )
}



interface SearchProps {
  selectedResult?: OrganizationMemberListItem;
  onSelectResult: (organizationMember: OrganizationMemberListItem) => void;
  managersToOrg?: number
}

export function Search({ selectedResult, onSelectResult, managersToOrg }: SearchProps) {
  const [searchQuery, setSearchQuery] = useState('');


  const handleSelectResult = (organizationMember: OrganizationMemberListItem) => {
    
    onSelectResult(organizationMember);
  };

  return (
    <Command
      shouldFilter={false}
      className="h-auto rounded-lg border border-b-0 shadow-md"
    >
      <CommandInput
        value={searchQuery}
        onValueChange={setSearchQuery}
        placeholder="Vyhľadať člena"
      />
      <SearchResults
          query={searchQuery}
          selectedResult={selectedResult}
          onSelectResult={handleSelectResult}
          managersToOrg={managersToOrg}
        />
    </Command>
  );
}

interface SearchResultsProps {
  query: string;
  selectedResult: SearchProps['selectedResult'];
  onSelectResult: SearchProps['onSelectResult'];
  managersToOrg?: number
}

function SearchResults({
  query,
  selectedResult,
  onSelectResult,
  managersToOrg
}: SearchResultsProps) {
  const [debouncedSearchQuery] = useDebounce(query, 500);

  const enabled = !!debouncedSearchQuery;

  const filters: ColumnFiltersState = [
    {id: 'name', value: debouncedSearchQuery}
  ]
  if(managersToOrg) filters.push({id: 'managers_to_org', value: managersToOrg})

  const membersQ = useOrganizationMembers(
    {pageIndex: 0, pageSize: 15},
    filters
  )
  // To get around this https://github.com/TanStack/query/issues/3584

  

  return (
    <CommandList>
      {/* TODO: these should have proper loading aria */}
      {membersQ.isLoading && <div className="p-4 text-sm">Hľadám...</div>}
      {!membersQ.isError && !membersQ.isLoading && !membersQ.data?.data.length && (
        <div className="p-4 text-sm">Nenašli sa členovia</div>
      )}
      {membersQ.isError && <div className="p-4 text-sm">Niečo sa pokazilo...</div>}

      {membersQ.data && membersQ.data.data.map((organizationMember) => {
        return (
          <CommandItem
            key={organizationMember.id}
            onSelect={() => onSelectResult(organizationMember)}
            value={organizationMember.user.name}
          >
            <Check
              className={cn(
                'mr-2 h-4 w-4',
                selectedResult?.id === organizationMember.id ? 'opacity-100' : 'opacity-0'
              )}
            />
            <div className="flex flex-col">
              <span>{organizationMember.user.name}, <span className="font-light">{organizationMember.position_name}</span></span>
              <span className="font-light">{organizationMember.organization.name}</span>
            </div>
          </CommandItem>
        );
      })}
    </CommandList>
  );
}