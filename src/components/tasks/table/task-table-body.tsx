import React from 'react';
import { TaskWithRelations } from '@/lib/types/task.types';
import TaskRow from './task-row';

interface TaskTableBodyProps {
    tasks: TaskWithRelations[];
    isLoading: boolean;
    expandedRows: Set<string>;
    loadingSubtasks: Set<string>;
    getSubtasks: (parentId: number) => TaskWithRelations[];
    onToggleRow: (taskId: number) => void;
}

// Render tasks recursively
const renderTasksRecursively = (
    parentTasks: TaskWithRelations[],
    nestingLevel: number = 0,
    expandedRows: Set<string>,
    loadingSubtasks: Set<string>,
    getSubtasks: (parentId: number) => TaskWithRelations[],
    onToggleRow: (taskId: number) => void
): React.ReactNode[] => {
    const elements: React.ReactNode[] = [];

    parentTasks.forEach(task => {
        const taskIdStr = task.id.toString();
        const isExpanded = expandedRows.has(taskIdStr);
        const isLoadingChildren = loadingSubtasks.has(taskIdStr);

        elements.push(
            <TaskRow
                key={task.id}
                task={task}
                nestingLevel={nestingLevel}
                isExpanded={isExpanded}
                isLoadingChildren={isLoadingChildren}
                onToggleRow={onToggleRow}
            />
        );

        // Only render subtasks if the parent task is expanded
        if (isExpanded) {
            const subtasks = getSubtasks(task.id);
            if (subtasks.length > 0) {
                elements.push(...renderTasksRecursively(
                    subtasks, 
                    nestingLevel + 1,
                    expandedRows,
                    loadingSubtasks,
                    getSubtasks,
                    onToggleRow
                ));
            }
        }
    });

    return elements;
};

export default function TaskTableBody({
    tasks,
    isLoading,
    expandedRows,
    loadingSubtasks,
    getSubtasks,
    onToggleRow
}: TaskTableBodyProps) {
    return (
        <tbody>
            {isLoading && tasks.length === 0 ? (
                <tr>
                    <td colSpan={8} className="py-8 text-center text-gray-500">
                        <div className="flex items-center justify-center gap-2">
                            <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
                            Načítavam úlohy...
                        </div>
                    </td>
                </tr>
            ) : tasks.length === 0 ? (
                <tr>
                    <td colSpan={8} className="py-8 text-center text-gray-500">
                        Žiadne úlohy neboli nájdené
                    </td>
                </tr>
            ) : (
                renderTasksRecursively(
                    tasks,
                    0,
                    expandedRows,
                    loadingSubtasks,
                    getSubtasks,
                    onToggleRow
                )
            )}
        </tbody>
    );
}