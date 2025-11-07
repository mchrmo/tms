"use client"

import React, { useState, useCallback, useEffect } from 'react';
import { useTasks } from '@/lib/hooks/task/task.hooks';
import { TaskWithRelations } from '@/lib/types/task.types';
import TaskTablePagination from './task-table-pagination';
import TaskTableHeader from './task-table-header';
import TaskTableBody from './task-table-body';
import { TaskTableFilter } from './task-table-filter';
import { ColumnFiltersState } from '@tanstack/react-table';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';

interface TasksTableProps {
  disableFilter?: boolean;
  hiddenFilters?: ColumnFiltersState;
}

export function TasksTable(
  { disableFilter, hiddenFilters }: TasksTableProps
) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [loadedSubtasks, setLoadedSubtasks] = useState<Map<number, TaskWithRelations[]>>(new Map());
  const [loadingSubtasks, setLoadingSubtasks] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [sortBy, setSortBy] = useState<string | null>('deadline');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filters, setFilters] = useState<ColumnFiltersState>([]);
  const [searchValue, setSearchValue] = useState('');
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize filters from URL params on mount
  useEffect(() => {
    const urlFilters: ColumnFiltersState = [];
    let urlSearch = '';
    let urlSortBy = 'deadline';
    let urlSortOrder: 'asc' | 'desc' = 'desc';
    let urlPage = 1;

    // Parse URL parameters
    searchParams.forEach((value, key) => {
      if (key === 'search') {
        urlSearch = value;
      } else if (key === 'sortBy') {
        urlSortBy = value;
      } else if (key === 'sortOrder') {
        urlSortOrder = value === 'asc' ? 'asc' : 'desc';
      } else if (key === 'page') {
        urlPage = parseInt(value, 10) || 1;
      } else {
        // All other params are treated as filters
        urlFilters.push({ id: key, value });
      }
    });

    if (hiddenFilters) {
      setFilters(hiddenFilters)
    } else setFilters(urlFilters);


    // Set initial state from URL
    setSearchValue(urlSearch);
    setSortBy(urlSortBy);
    setSortOrder(urlSortOrder);
    setPage(urlPage);
    setIsInitialized(true);
  }, []); // Only run on mount

  // Update URL when filters, search, sorting, or pagination changes (but not on initialization)
  useEffect(() => {
    if (!isInitialized) return;

    const params = new URLSearchParams();

    // Add search parameter
    if (searchValue) {
      params.set('search', searchValue);
    }

    // Add filter parameters
    filters.forEach(filter => {
      if (filter.value) {
        params.set(filter.id, String(filter.value));
      }
    });

    // Add sorting parameters (only if different from default)
    if (sortBy !== 'deadline') {
      params.set('sortBy', sortBy || '');
    }
    if (sortOrder !== 'desc') {
      params.set('sortOrder', sortOrder);
    }

    // Add page parameter (only if not page 1)
    if (page > 1) {
      params.set('page', page.toString());
    }

    // Update URL without causing page reload
    const newUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname;
    router.push(newUrl, { scroll: false });
  }, [filters, searchValue, sortBy, sortOrder, page, pathname, router, isInitialized]);

  // Reset pagination when filters or sorting changes (but not on initial load)
  useEffect(() => {
    if (!isInitialized) return;
    setPage(1);
  }, [filters, searchValue, sortBy, sortOrder, isInitialized]);

  // Fetch top-level tasks
  const { data: tasks, isLoading, error } = useTasks({
    page,
    pageSize,
    sort: sortBy ? { id: sortBy, desc: sortOrder === 'desc' } : undefined,
    filter: [...filters, ...(searchValue ? [{ id: 'name', value: searchValue }] : [])]
  });

  // Use tasks from hook or fallback to empty array
  const currentTasks: TaskWithRelations[] = tasks?.data || [];

  const loadSubtasks = useCallback(async (parentId: number) => {
    const taskIdStr = parentId.toString();
    setLoadingSubtasks(prev => new Set([...Array.from(prev), taskIdStr]));

    try {
      // Fetch subtasks for the specific parent
      const response = await fetch(`/api/tasks?parent_id=${parentId}&page=1&pageSize=50`);
      if (response.ok) {
        const subtasksData = await response.json();
        setLoadedSubtasks(prev => new Map([...Array.from(prev.entries()), [parentId, subtasksData.data]]));
      }
    } catch (error) {
      console.error('Error loading subtasks:', error);
    } finally {
      setLoadingSubtasks(prev => {
        const newSet = new Set(Array.from(prev));
        newSet.delete(taskIdStr);
        return newSet;
      });
    }
  }, []);

  // Get subtasks from loaded data
  const getSubtasks = useCallback((parentId: number): TaskWithRelations[] => {
    return loadedSubtasks.get(parentId) || [];
  }, [loadedSubtasks]);

  const toggleRow = useCallback(async (taskId: number) => {
    const taskIdStr = taskId.toString();
    const newExpanded = new Set(Array.from(expandedRows));

    if (newExpanded.has(taskIdStr)) {
      // Collapsing - remove this task and all its descendants from expanded rows
      newExpanded.delete(taskIdStr);

      // Recursively remove all descendant task IDs from expanded rows
      const removeDescendants = (parentId: number) => {
        const children = getSubtasks(parentId);
        children.forEach(child => {
          newExpanded.delete(child.id.toString());
          removeDescendants(child.id); // Recursively remove grandchildren
        });
      };

      removeDescendants(taskId);
    } else {
      // Expanding - add this task to expanded rows
      newExpanded.add(taskIdStr);
      // Load subtasks if not already loaded
      if (!loadedSubtasks.has(taskId)) {
        await loadSubtasks(taskId);
      }
    }

    setExpandedRows(newExpanded);
  }, [expandedRows, loadedSubtasks, loadSubtasks, getSubtasks]);

  // Pagination handlers
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  // Handle sorting
  const handleSort = (columnId: string) => {
    if (sortBy === columnId) {
      // Toggle sort order
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new sort column
      setSortBy(columnId);
      setSortOrder('asc');
    }
  };

  if (error) {
    return (
      <div className="w-full flex justify-center items-center py-8">
        <div className="text-red-500">
          Chyba pri načítaní úloh: {error instanceof Error ? error.message : 'Neznáma chyba'}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      {/* Filter Component */}

      {
        !disableFilter &&
        <TaskTableFilter
          filters={filters}
          onFiltersChange={setFilters}
          searchValue={searchValue}
          onSearchChange={setSearchValue}
          isInitialized={isInitialized}
        />
      }
      <div className="overflow-x-auto">
        <table className="w-full border-collapse bg-white">
          <TaskTableHeader
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSort={handleSort}
          />
          <TaskTableBody
            tasks={currentTasks}
            isLoading={isLoading}
            expandedRows={expandedRows}
            loadingSubtasks={loadingSubtasks}
            getSubtasks={getSubtasks}
            onToggleRow={toggleRow}
          />
        </table>
      </div>

      {/* Pagination Controls */}
      {tasks?.meta && tasks.meta.total > 10 && (
        <TaskTablePagination
          currentPage={tasks.meta.currentPage}
          totalPages={tasks.meta.lastPage}
          totalItems={tasks.meta.total}
          itemsPerPage={pageSize}
          onPageChange={handlePageChange}
          isLoading={isLoading}
        />
      )}
    </div>
  );
}
