import React from 'react';
import { ChevronRight, ListTreeIcon } from 'lucide-react';
import Link from 'next/link';
import { cx } from 'class-variance-authority';
import { TaskWithRelations } from '@/lib/types/task.types';
import { TaskStatus } from '@prisma/client';
import { formatDate } from '@/lib/utils/dates';
import { shortenName } from '@/lib/utils/text';
import { TASK_STATUSES_MAP } from '@/lib/models/task.model';
import { getStatusBadge, getPriorityIcon, Spacer, getSubtaskCount } from './task-table-utils';

interface TaskRowProps {
    task: TaskWithRelations;
    nestingLevel?: number;
    isExpanded: boolean;
    isLoadingChildren: boolean;
    onToggleRow: (taskId: number) => void;
}

export default function TaskRow({ 
    task, 
    nestingLevel = 0, 
    isExpanded, 
    isLoadingChildren, 
    onToggleRow 
}: TaskRowProps) {
    const indentationPx = nestingLevel * 24; // 24px per level
    const hasSubtasks = getSubtaskCount(task) > 0;

    return (
        <tr key={task.id} className="border-b border-gray-100 hover:bg-gray-50 group">
            {/* Name Column - Fixed */}
            <td className="py-2 px-4 sticky left-0 bg-white group-hover:bg-gray-50 z-10 border-r border-gray-200 w-80 min-w-80 max-w-80 transition-colors">
                <div className="flex items-center gap-2" style={{ marginLeft: `${indentationPx}px` }}>
                    {hasSubtasks ? (
                        <button
                            onClick={() => onToggleRow(task.id)}
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
            {/* Scrollable Columns */}
            <td className="py-2 px-4 text-gray-700 text-sm bg-white group-hover:bg-gray-50 transition-colors">{formatDate(task.createdAt)}</td>
            <td className="py-2 px-4 bg-white group-hover:bg-gray-50 transition-colors">
                {getPriorityIcon(task.priority)}
            </td>
            <td className="py-2 px-4 bg-white group-hover:bg-gray-50 transition-colors">
                <span className={cx(getStatusBadge(task.status), 'text-nowrap')}>
                    {TASK_STATUSES_MAP[task.status as TaskStatus]}
                </span>
            </td>
            <td className="py-2 px-4 text-gray-700 text-sm bg-white group-hover:bg-gray-50 transition-colors">{formatDate(task.deadline)}</td>
            <td className="py-2 px-4 text-gray-700 text-sm bg-white group-hover:bg-gray-50 transition-colors">{shortenName(task.creator?.user?.name || '')}</td>
            <td className="py-2 px-4 text-gray-700 text-sm bg-white group-hover:bg-gray-50 transition-colors">{shortenName(task.assignee?.user?.name || '')}</td>
            <td className="py-2 px-4 text-gray-700 text-sm bg-white group-hover:bg-gray-50 transition-colors">{task.source}</td>
        </tr>
    );
}