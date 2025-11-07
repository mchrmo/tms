'use client'

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Command, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { CalendarIcon, Check, ChevronDownIcon, HashIcon, PlusIcon, SearchIcon, TextIcon, XIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useDebouncedCallback } from "use-debounce";
import { format } from "date-fns";
import { ColumnFiltersState } from "@tanstack/react-table";

// Task-specific filter definitions
interface TaskFilterDef {
  id: string;
  label: string;
  type: 'string' | 'enum' | 'datetime';
  enum?: { [key: string]: string };
}

const TASK_FILTER_DEFINITIONS: TaskFilterDef[] = [
  {
    id: 'name',
    label: 'Názov úlohy',
    type: 'string'
  },
  {
    id: 'status',
    label: 'Stav',
    type: 'enum',
    enum: {
      'TODO': 'Nová',
      'WAITING': 'Čaká',
      'INPROGRESS': 'Prebieha',
      'CHECKREQ': 'Kontrola',
      'DONE': 'Dokončená'
    }
  },
  {
    id: 'priority',
    label: 'Priorita',
    type: 'enum',
    enum: {
      'CRITICAL': 'Kritická',
      'HIGH': 'Vysoká',
      'MEDIUM': 'Stredná',
      'LOW': 'Nízka'
    }
  },
  {
    id: 'assignee_name',
    label: 'Zodpovedná osoba',
    type: 'string'
  },
  {
    id: 'creator_name',
    label: 'Vytvorateľ',
    type: 'string'
  },
  {
    id: 'organization_name',
    label: 'Organizácia',
    type: 'string'
  },
  {
    id: 'deadline',
    label: 'Termín',
    type: 'datetime'
  },
  {
    id: 'source',
    label: 'Zdroj',
    type: 'string'
  }
];

interface ActiveFilter {
  filterDef: TaskFilterDef;
  id: string;
  value: string;
}

type TaskTableFilterProps = {
  filters: ColumnFiltersState;
  onFiltersChange: (filters: ColumnFiltersState) => void;
  searchValue: string;
  onSearchChange: (value: string) => void;
  isInitialized?: boolean;
}

export function TaskTableFilter({
  filters,
  onFiltersChange,
  searchValue,
  onSearchChange,
  isInitialized = true
}: TaskTableFilterProps) {
  const [activeFilters, setActiveFilters] = useState<ActiveFilter[]>([]);

  const debouncedSearch = useDebouncedCallback((value: string) => {
    onSearchChange(value);
  }, 500);

  // Convert filters to active filters on mount and when filters change
  useEffect(() => {
    if (!isInitialized) return;
    
    const newActiveFilters: ActiveFilter[] = filters
      .map(filter => {
        const filterDef = TASK_FILTER_DEFINITIONS.find(def => def.id === filter.id);
        if (!filterDef) return null;
        return {
          filterDef,
          id: filter.id,
          value: Array.isArray(filter.value) ? filter.value.join(',') : String(filter.value || '')
        };
      })
      .filter((filter): filter is ActiveFilter => filter !== null);
    
    setActiveFilters(newActiveFilters);
  }, [filters, isInitialized]);

  // Get available filter options (excluding already active filters)
  const getAvailableFilters = () => {
    return TASK_FILTER_DEFINITIONS.filter(
      def => !activeFilters.find(active => active.id === def.id)
    );
  };

  const addFilter = (filterId: string, value: string = '') => {
    const filterDef = TASK_FILTER_DEFINITIONS.find(def => def.id === filterId);
    if (!filterDef || activeFilters.find(f => f.id === filterId)) return;

    const newActiveFilter = { filterDef, id: filterId, value };
    const newActiveFilters = [...activeFilters, newActiveFilter];
    setActiveFilters(newActiveFilters);
    
    // Update filters
    const newFilters = newActiveFilters.map(f => ({ id: f.id, value: f.value }));
    onFiltersChange(newFilters);
  };

  const removeFilter = (filterId: string) => {
    const newActiveFilters = activeFilters.filter(f => f.id !== filterId);
    setActiveFilters(newActiveFilters);
    
    // Update filters
    const newFilters = newActiveFilters.map(f => ({ id: f.id, value: f.value }));
    onFiltersChange(newFilters);
  };

  const updateFilter = (filterId: string, value: string | string[]) => {
    const stringValue = Array.isArray(value) ? value.join(',') : value;
    const newActiveFilters = activeFilters.map(f => 
      f.id === filterId ? { ...f, value: stringValue } : f
    );
    
    // Only update if the value actually changed
    const currentFilter = activeFilters.find(f => f.id === filterId);
    if (currentFilter && currentFilter.value === stringValue) {
      return;
    }
    
    setActiveFilters(newActiveFilters);
    
    // Update filters
    const newFilters = newActiveFilters.map(f => ({ id: f.id, value: f.value }));
    onFiltersChange(newFilters);
  };

  const availableFilters = getAvailableFilters();

  return (
    <div className="space-y-4">
      {/* Primary search and add filter */}
      <div className="flex w-full max-w-sm items-center space-x-2">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            className="pl-10"
            placeholder="Vyhľadávanie úloh..."
            value={searchValue}
            onChange={(e) => debouncedSearch(e.target.value)}
          />
        </div>
        <AddFilterCombobox
          availableFilters={availableFilters}
          onAddFilter={addFilter}
        />
      </div>

      {/* Active filters */}
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {activeFilters.map(filter => (
            <FilterItem
              key={`${filter.id}-${filter.value}`}
              filter={filter}
              onRemove={removeFilter}
              onUpdate={updateFilter}
            />
          ))}
        </div>
      )}
    </div>
  );
}

type AddFilterComboboxProps = {
  availableFilters: TaskFilterDef[];
  onAddFilter: (filterId: string) => void;
}

function AddFilterCombobox({ availableFilters, onAddFilter }: AddFilterComboboxProps) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          role="combobox"
          disabled={availableFilters.length === 0}
        >
          <PlusIcon className="mr-2 size-4 opacity-50" aria-hidden="true" />
          Pridať filter
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[12.5rem] p-0" align="start">
        <Command>
          <CommandInput placeholder="Stĺpec..." />
          <CommandList>
            <CommandGroup>
              {availableFilters.map((filterDef) => (
                <CommandItem
                  key={filterDef.id}
                  value={filterDef.id}
                  onSelect={(value) => {
                    onAddFilter(value);
                    setOpen(false);
                  }}
                >
                  {filterDef.type === 'enum' && <ChevronDownIcon className="mr-2 size-4" aria-hidden="true" />}
                  {filterDef.type === 'string' && <TextIcon className="mr-2 size-4" aria-hidden="true" />}
                  {filterDef.type === 'datetime' && <CalendarIcon className="mr-2 size-4" aria-hidden="true" />}
                  {filterDef.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

function FilterItem({ 
  filter, 
  onRemove, 
  onUpdate 
}: { 
  filter: ActiveFilter; 
  onRemove: (id: string) => void; 
  onUpdate: (id: string, value: string | string[]) => void; 
}) {
  const [open, setOpen] = useState(false);

  const debouncedInput = useDebouncedCallback((value: string) => {
    onUpdate(filter.id, value);
  }, 500);

  const getDisplayValue = () => {
    if (!filter.value) return '';
    
    switch (filter.filterDef.type) {
      case 'enum':
        return filter.value
          .split(',')
          .map(v => filter.filterDef.enum?.[v] || v)
          .join(', ');
      case 'datetime':
        try {
          return format(new Date(filter.value), 'dd.MM.yyyy');
        } catch {
          return filter.value;
        }
      default:
        return filter.value;
    }
  };

  return (
    <div className={cn(
      "px-3 py-1 border border-gray-300 rounded-md flex items-center space-x-2 bg-white",
      { "bg-blue-50 border-blue-200": open }
    )}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger className="flex-1 text-left">
          <div className="flex flex-col">
            <span className={cn("font-medium text-sm", { 'line-through': !filter.value && !open })}>
              {filter.filterDef.label}
            </span>
            {filter.value && (
              <span className="text-xs text-gray-500 truncate max-w-[150px]">
                {getDisplayValue()}
              </span>
            )}
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-3 min-w-[200px]">
          {filter.filterDef.type === 'string' && (
            <Input
              className="h-8"
              placeholder={filter.filterDef.label}
              defaultValue={filter.value}
              onChange={(e) => debouncedInput(e.target.value)}
            />
          )}
          
          {filter.filterDef.type === 'enum' && (
            <FilterItemSelect filter={filter} onUpdate={onUpdate} />
          )}
          
          {filter.filterDef.type === 'datetime' && (
            <FilterItemDatetime filter={filter} onUpdate={onUpdate} />
          )}
        </PopoverContent>
      </Popover>

      <Button
        onClick={() => onRemove(filter.id)}
        variant="ghost"
        size="sm"
        className="p-1 h-6 w-6"
      >
        <XIcon size={12} />
      </Button>
    </div>
  );
}

function FilterItemSelect({ 
  filter, 
  onUpdate 
}: { 
  filter: ActiveFilter; 
  onUpdate: (id: string, value: string[]) => void; 
}) {
  const defaultValues = filter.value ? filter.value.split(',').filter(v => v) : [];
  const [selectedValues, setSelectedValues] = useState<string[]>(defaultValues);

  // Sync with external filter value changes
  useEffect(() => {
    const currentValues = filter.value ? filter.value.split(',').filter(v => v) : [];
    const currentSet = new Set(currentValues);
    const selectedSet = new Set(selectedValues);
    
    // Only update if the values are actually different
    if (currentValues.length !== selectedValues.length || 
        !currentValues.every(v => selectedSet.has(v)) ||
        !selectedValues.every(v => currentSet.has(v))) {
      setSelectedValues(currentValues);
    }
  }, [filter.value]);

  if (!filter.filterDef.enum) return null;

  return (
    <Command>
      <CommandList className="max-h-[200px]">
        <CommandGroup>
          {Object.entries(filter.filterDef.enum).map(([key, label]) => {
            const isSelected = selectedValues.includes(key);
            return (
              <CommandItem
                key={key}
                onSelect={() => {
                  const newValues = isSelected
                    ? selectedValues.filter(v => v !== key)
                    : [...selectedValues, key];
                  setSelectedValues(newValues);
                  onUpdate(filter.id, newValues);
                }}
              >
                <div className={cn(
                  "mr-2 flex size-4 items-center justify-center rounded-sm border border-primary",
                  isSelected
                    ? "bg-primary text-primary-foreground"
                    : "opacity-50 [&_svg]:invisible"
                )}>
                  <Check className="size-4" aria-hidden="true" />
                </div>
                <span>{label}</span>
              </CommandItem>
            );
          })}
        </CommandGroup>
      </CommandList>
    </Command>
  );
}

function FilterItemDatetime({ 
  filter, 
  onUpdate 
}: { 
  filter: ActiveFilter; 
  onUpdate: (id: string, value: string) => void; 
}) {
  const defaultDate = filter.value ? new Date(filter.value) : new Date();
  const [date, setDate] = useState<Date>(
    !isNaN(defaultDate.getTime()) ? defaultDate : new Date()
  );

  const selectDate = (selectedDate?: Date) => {
    if (!selectedDate) return;
    setDate(selectedDate);
    onUpdate(filter.id, selectedDate.toISOString());
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-[240px] justify-start text-left font-normal",
            !date && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "dd.MM.yyyy") : <span>Vybrať dátum</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={selectDate}
          defaultMonth={date}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}