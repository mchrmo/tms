import React from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

interface TaskTableHeaderProps {
    sortBy: string | null;
    sortOrder: 'asc' | 'desc';
    onSort: (columnId: string) => void;
}

// Define which columns are not sortable
const nonSortableColumns = ['creator_name', 'assignee_name'];

// Get sort icon for column
const getSortIcon = (columnId: string, sortBy: string | null, sortOrder: 'asc' | 'desc') => {
    if (sortBy !== columnId) {
        return <ArrowUpDown className="w-3 h-3 ml-1 opacity-50" />;
    }
    return sortOrder === 'asc' 
        ? <ArrowUp className="w-3 h-3 ml-1" />
        : <ArrowDown className="w-3 h-3 ml-1" />;
};

// Sortable header component
const SortableHeader = ({ 
    columnId, 
    children, 
    className = "", 
    sortBy, 
    sortOrder, 
    onSort 
}: { 
    columnId: string; 
    children: React.ReactNode; 
    className?: string;
    sortBy: string | null;
    sortOrder: 'asc' | 'desc';
    onSort: (columnId: string) => void;
}) => {
    const isDisabled = nonSortableColumns.includes(columnId);
    
    if (isDisabled) {
        return (
            <th className={`text-left py-2 px-4 font-semibold text-gray-700 text-sm text-nowrap ${className}`}>
                {children}
            </th>
        );
    }
    
    return (
        <th 
            className={`text-left py-2 px-4 font-semibold text-gray-700 text-sm cursor-pointer hover:bg-gray-50 select-none text-nowrap ${className}`}
            onClick={() => onSort(columnId)}
        >
            <div className="flex items-center">
                {children}
                {getSortIcon(columnId, sortBy, sortOrder)}
            </div>
        </th>
    );
};

export default function TaskTableHeader({ sortBy, sortOrder, onSort }: TaskTableHeaderProps) {
    return (
        <thead>
            <tr className="border-b border-gray-200">
                {/* Fixed Name Column Header */}
                <SortableHeader 
                    columnId="name" 
                    className="w-90 min-w-90 max-w-80 sticky left-0 bg-white z-20 border-r border-gray-200"
                    sortBy={sortBy}
                    sortOrder={sortOrder}
                    onSort={onSort}
                >
                    Názov
                </SortableHeader>
                {/* Scrollable Column Headers */}
                <SortableHeader 
                    columnId="createdAt" 
                    className="min-w-28"
                    sortBy={sortBy}
                    sortOrder={sortOrder}
                    onSort={onSort}
                >
                    Vznik
                </SortableHeader>
                <SortableHeader 
                    columnId="priority" 
                    className="min-w-20"
                    sortBy={sortBy}
                    sortOrder={sortOrder}
                    onSort={onSort}
                >
                    Priorita
                </SortableHeader>
                <SortableHeader 
                    columnId="status" 
                    className="min-w-24"
                    sortBy={sortBy}
                    sortOrder={sortOrder}
                    onSort={onSort}
                >
                    Status
                </SortableHeader>
                <SortableHeader 
                    columnId="deadline" 
                    className="min-w-28"
                    sortBy={sortBy}
                    sortOrder={sortOrder}
                    onSort={onSort}
                >
                    Termín
                </SortableHeader>
                <SortableHeader 
                    columnId="creator_name" 
                    className="min-w-32"
                    sortBy={sortBy}
                    sortOrder={sortOrder}
                    onSort={onSort}
                >
                    Vytvárateľ
                </SortableHeader>
                <SortableHeader 
                    columnId="assignee_name" 
                    className="min-w-32"
                    sortBy={sortBy}
                    sortOrder={sortOrder}
                    onSort={onSort}
                >
                    Zodp. osoba
                </SortableHeader>
                <SortableHeader 
                    columnId="source" 
                    className="min-w-40"
                    sortBy={sortBy}
                    sortOrder={sortOrder}
                    onSort={onSort}
                >
                    Zdroj
                </SortableHeader>
            </tr>
        </thead>
    );
}