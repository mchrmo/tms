import AddButton from "@/components/common/buttons/add-button"
import { ReactElement, useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "react-day-picker"
import { PlusIcon, Trash2 } from "lucide-react"
import TaskReminderForm from "./taskReminder-form"
import { TaskReminder } from "@prisma/client"
import { useDeleteTaskReminder } from "@/lib/hooks/task/taskReminder.hooks"


function TaskReminderModal({children, defaultValues}: {children: ReactElement, defaultValues: Partial<TaskReminder>}) {

  const [isForm, setIsForm] = useState(false)

  return (
    <>

        <Dialog open={isForm} onOpenChange={setIsForm}>
          <DialogTrigger asChild>
            {children}
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {
                defaultValues.id ?
                'Upraviť pripomienku'
                :
                'Nová pripomienka'
                }</DialogTitle>
              <DialogDescription>
                
              </DialogDescription>
            </DialogHeader>
            <TaskReminderForm 
            defaultValues={defaultValues}
            onCancel={() => {
                  setIsForm(false)
                }}></TaskReminderForm>
          </DialogContent>
        </Dialog>
    </>
  )
}

export function CreateTaskReminder({task_id}: {task_id: number}) {

  return (
    <>
        <TaskReminderModal defaultValues={{task_id}}>
          <AddButton variant={'outline'}>Pridať pripomienku</AddButton>
          {/* <span>open</span> */}
        </TaskReminderModal>
    </>
  )
}

export function EditTaskReminder({taskReminder, children}: {taskReminder: TaskReminder, children: ReactElement}) {

  return (
    <>
        <TaskReminderModal defaultValues={taskReminder}>
          {children}
        </TaskReminderModal>
    </>
  )
}

export function DeleteTaskReminder({task_id}: {task_id: number}) {

  const deleteQuery = useDeleteTaskReminder(task_id)

  return (
    <Trash2 onClick={() => deleteQuery.mutate()} width={16} className="link-danger"/>
  )
}