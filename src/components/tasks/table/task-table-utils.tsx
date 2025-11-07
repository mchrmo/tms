import { FlagIcon } from 'lucide-react';
import { TaskWithRelations } from '@/lib/types/task.types';

export const getStatusBadge = (status: TaskWithRelations['status']) => {
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

export const getPriorityIcon = (priority: TaskWithRelations['priority']) => {
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

export const Spacer = () => <div className='w-6 h-full'> </div>;

export const getSubtaskCount = (task: TaskWithRelations): number => {
    return task._count?.SubTasks || 0;
};