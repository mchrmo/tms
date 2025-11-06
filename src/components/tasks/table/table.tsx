"use client"

import { ChevronDown, ChevronRight, FlagIcon, ListTreeIcon, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import React, { useState, useCallback } from 'react';
import { useTasks } from '@/lib/hooks/task/task.hooks';
import { TaskWithRelations } from '@/lib/types/task.types';
import TaskTablePagination from './task-table-pagination';
import { formatDate } from '@/lib/utils/dates';
import { shortenName } from '@/lib/utils/text';
import { TASK_STATUSES_MAP } from '@/lib/models/task.model';
import { TaskStatus } from '@prisma/client';
import { cx } from 'class-variance-authority';
import Link from 'next/link';

const getStatusBadge = (status: TaskWithRelations['status']) => {
    const baseClasses = 'px-2 py-1 rounded-full text-xs font-medium';

    switch (status) {
        case 'DONE':
            return `${baseClasses} bg-cyan-500 text-white`;
        case 'INPROGRESS':
            return `${baseClasses} bg-purple-500 text-white`;
        case 'TODO':
            return `${baseClasses} bg-pink-500 text-white`;
        default:
            return `${baseClasses} bg-gray-500 text-white`;
    }
};

const getPriorityIcon = (priority: TaskWithRelations['priority']) => {
    const baseClasses = 'w-4 h-4';

    switch (priority) {
        case 'HIGH':
            return <FlagIcon className={`${baseClasses} text-red-500`}></FlagIcon>;
        case 'MEDIUM':
            return <FlagIcon className={`${baseClasses} text-yellow-500`}></FlagIcon>;
        case 'LOW':
            return <FlagIcon className={`${baseClasses} text-green-500`}></FlagIcon>;
        default:
            return <FlagIcon className={`${baseClasses} text-gray-500`}></FlagIcon>;
    }
};

const Spacer = () => <div className='w-6 h-full'> </div>;

export default function TaskTable() {
    const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
    const [loadedSubtasks, setLoadedSubtasks] = useState<Map<number, TaskWithRelations[]>>(new Map());
    const [loadingSubtasks, setLoadingSubtasks] = useState<Set<string>>(new Set());
    const [page, setPage] = useState(1);
    const [pageSize] = useState(10);
    const [sortBy, setSortBy] = useState<string | null>(null);
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

    // Fetch top-level tasks
    const { data: tasks, isLoading, error } = useTasks({
        page,
        pageSize,
        sort: sortBy ? { id: sortBy, desc: sortOrder === 'desc' } : undefined,
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

    // Get subtask count from _count field
    const getSubtaskCount = (task: TaskWithRelations): number => {
        return task._count?.SubTasks || 0;
    };

    // Render a task row with proper nesting
    const renderTaskRow = (task: TaskWithRelations, nestingLevel: number = 0) => {
        let indentationPx = nestingLevel * 24; // 24px per level
        const taskIdStr = task.id.toString();
        const hasSubtasks = getSubtaskCount(task) > 0;
        const isExpanded = expandedRows.has(taskIdStr);
        const isLoadingChildren = loadingSubtasks.has(taskIdStr);

        return (
            <tr key={task.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-2 ">
                    <div className="flex items-center gap-2" style={{ marginLeft: `${indentationPx}px` }}>
                        {hasSubtasks ? (
                            <button
                                onClick={() => toggleRow(task.id)}
                                disabled={isLoadingChildren}
                                className="flex-shrink-0 p-1 hover:bg-gray-200 rounded transition-colors disabled:opacity-50"
                                aria-label={isExpanded ? 'Zbaliť úlohy' : 'Rozbaliť úlohy'}
                            >
                                {isLoadingChildren ? (
                                    <div className="w-3 h-3 border border-gray-400 border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <ChevronRight className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                                )}
                            </button>
                        ) : <Spacer />}
                        <div className="min-w-0 flex-1">
                            <div className={`font-medium text-gray-900 ${nestingLevel > 0 ? 'text-xs' : 'text-sm'} break-words`}>
                                <Link className="" href={'/tasks/' + task.id}>{task.name}</Link>
                            </div>
                            {hasSubtasks && (
                                <div className="text-xs text-gray-500 flex items-center gap-1 mt-1 text-nowrap">
                                    <ListTreeIcon className='w-4 h-4' />
                                    <span>{getSubtaskCount(task)}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </td>
                <td className="py-2 px-4 text-gray-700 text-sm">{formatDate(task.createdAt)}</td>
                <td className="py-2 px-4">
                    {getPriorityIcon(task.priority)}
                </td>
                <td className="py-2 px-4">
                    <span className={cx(getStatusBadge(task.status), 'text-nowrap')}>
                        {TASK_STATUSES_MAP[task.status as TaskStatus]}
                    </span>
                </td>
                <td className="py-2 px-4 text-gray-700 text-sm">{formatDate(task.deadline)}</td>
                <td className="py-2 px-4 text-gray-700 text-sm">{shortenName(task.creator?.user?.name || '')}</td>
                <td className="py-2 px-4 text-gray-700 text-sm">{shortenName(task.assignee?.user?.name || '')}</td>
                <td className="py-2 px-4 text-gray-700 text-sm">{task.source}</td>
            </tr>
        );
    };

    // Render tasks recursively with dynamic loading
    const renderTasksRecursively = (parentTasks: TaskWithRelations[], nestingLevel: number = 0): React.ReactNode[] => {
        const elements: React.ReactNode[] = [];

        parentTasks.forEach(task => {
            elements.push(renderTaskRow(task, nestingLevel));

            // Only render subtasks if the parent task is expanded
            if (expandedRows.has(task.id.toString())) {
                const subtasks = getSubtasks(task.id);
                if (subtasks.length > 0) {
                    elements.push(...renderTasksRecursively(subtasks, nestingLevel + 1));
                }
            }
        });

        return elements;
    };

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

    // Get sort icon for column
    const getSortIcon = (columnId: string) => {
        if (sortBy !== columnId) {
            return <ArrowUpDown className="w-3 h-3 ml-1 opacity-50" />;
        }
        return sortOrder === 'asc' 
            ? <ArrowUp className="w-3 h-3 ml-1" />
            : <ArrowDown className="w-3 h-3 ml-1" />;
    };

    // Sortable header component
    const SortableHeader = ({ columnId, children, className = "" }: { 
        columnId: string; 
        children: React.ReactNode; 
        className?: string;
    }) => (
        <th 
            className={`text-left py-2 px-4 font-semibold text-gray-700 text-sm cursor-pointer hover:bg-gray-50 select-none ${className}`}
            onClick={() => handleSort(columnId)}
        >
            <div className="flex items-center">
                {children}
                {getSortIcon(columnId)}
            </div>
        </th>
    );

    if (isLoading && currentTasks.length === 0) {
        return (
            <div className="w-full flex justify-center items-center py-8">
                <div className="text-gray-500">Načítavam úlohy...</div>
            </div>
        );
    }

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
        <div className="w-full">
            <div className="flex">
                {/* Fixed Name Column */}
                <div className="flex-shrink-0 border-r border-gray-200">
                    <table className="border-collapse bg-white">
                        <thead>
                            <tr className="border-b border-gray-200">
                                <SortableHeader columnId="name" className="w-80 min-w-80 max-w-80">
                                    Názov
                                </SortableHeader>
                            </tr>
                        </thead>
                        <tbody>
                            {currentTasks.length === 0 ? (
                                <tr>
                                    <td className="py-8 px-4 text-center text-gray-500 w-80">
                                        Žiadne úlohy neboli nájdené
                                    </td>
                                </tr>
                            ) : (
                                renderTasksRecursively(currentTasks)
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Scrollable Other Columns */}
                <div className="flex-1 overflow-x-auto">
                    <table className="w-full border-collapse bg-white">
                        <thead>
                            <tr className="border-b border-gray-200">
                                <SortableHeader columnId="createdAt" className="min-w-28">
                                    Vznik
                                </SortableHeader>
                                <SortableHeader columnId="priority" className="min-w-20">
                                    Priorita
                                </SortableHeader>
                                <SortableHeader columnId="status" className="min-w-24">
                                    Status
                                </SortableHeader>
                                <SortableHeader columnId="deadline" className="min-w-28">
                                    Termín
                                </SortableHeader>
                                <SortableHeader columnId="creator" className="min-w-32">
                                    Vytvárateľ
                                </SortableHeader>
                                <SortableHeader columnId="assignee" className="min-w-32">
                                    Zodp. osoba
                                </SortableHeader>
                                <SortableHeader columnId="source" className="min-w-40">
                                    Zdroj
                                </SortableHeader>
                            </tr>
                        </thead>
                        <tbody>
                            {currentTasks.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="py-8 text-center text-gray-500">
                                        Žiadne úlohy neboli nájdené
                                    </td>
                                </tr>
                            ) : (
                                renderTasksRecursively(currentTasks)
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination Controls */}
            {tasks?.meta && (
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

    // Helper function to get task from row index
    function getTaskFromRowIndex(index: number): TaskWithRelations | null {
        const allVisibleTasks = flattenVisibleTasks(currentTasks);
        return allVisibleTasks[index] || null;
    }

    // Helper function to flatten visible tasks including expanded subtasks
    function flattenVisibleTasks(tasks: TaskWithRelations[], level: number = 0): TaskWithRelations[] {
        const result: TaskWithRelations[] = [];
        
        tasks.forEach(task => {
            result.push(task);
            
            if (expandedRows.has(task.id.toString())) {
                const subtasks = getSubtasks(task.id);
                if (subtasks.length > 0) {
                    result.push(...flattenVisibleTasks(subtasks, level + 1));
                }
            }
        });
        
        return result;
    }

    // Helper function to get nesting level for a task at a specific index
    function getNestingLevel(task: TaskWithRelations, index: number): number {
        let level = 0;
        let currentTask = task;
        const allVisibleTasks = flattenVisibleTasks(currentTasks);

        while (currentTask.parent_id) {
            level++;
            const parent = allVisibleTasks.find(t => t.id === currentTask.parent_id);
            if (!parent) break;
            currentTask = parent;
        }

        return level;
    }
}