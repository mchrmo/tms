'use client'
import { useTask } from "@/lib/hooks/task/task.hooks";
import { Task } from "@prisma/client";
import ViewHeadline from "@/components/common/view-haedline";
import TaskForm from "./task-form";
import LoadingSpinner from "@/components/ui/loading-spinner";
import TasksTable from "./table";
import Link from "next/link";
import { Label } from "@/components/ui/label";
import TaskRemindersOverview from "./reminders/taskReminders-overview";
import AddButton from "@/components/common/buttons/add-button";
import TaskUpdatesOverview from "./updates/taskUpdates-overview";
import { useState } from "react";
import clsx from "clsx";
import { TabsTrigger, Tabs, TabsContent, TabsList } from "@/components/ui/tabs";
import TaskCommentsOverview from "./comments/taskComments-overview";
import TaskAttachmentsOverview from "./attachments/taskAttachments-overview";
import { TaskDetail as TaskDetailT } from "@/lib/services/tasks/task.service";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { EyeIcon, icons, SettingsIcon } from "lucide-react";
import { Checkbox } from "../ui/checkbox";
import { Button } from "../ui/button";


export default function TaskDetail({ params }: { params: { id: string } }) {

  const taskId = parseInt(params.id)
  const task = useTask(taskId)

  const parent = useTask((task.data && task.data.parent_id) ? task.data.parent_id : undefined)

  const [tab, setTab] = useState('subtasks')

  // to delete
  const [variant, setVariant] = useState<'ghost' | 'default'>('ghost') 


  if (task.isLoading) return <span>Úloha sa načitáva <LoadingSpinner></LoadingSpinner></span>

  return (
    <>
      {task.error instanceof Error && <div>{task.error.message}</div>}

      {
        task.data && (
          <>

            <div className="">
              <div className="flex justify-between">
                <ViewHeadline>Detail úlohy</ViewHeadline>
                <div className="">
                  <Button onClick={() => setVariant(variant == 'ghost' ? 'default' : 'ghost')} variant={variant} size={'icon'}>
                    <EyeIcon  />
                  </Button>
                  <TaskSettings task={task.data} />
                </div>
              </div>
            </div>
            {
              parent.data && <Label className="text-md">
                Úloha podradená pod úlohu: <Link className="link" href={`/tasks/${parent.data.id}`}>{parent.data.name}</Link>
              </Label>
            }

            <TaskForm defaultValues={task.data} edit={true}></TaskForm>

            <Tabs value={tab} onValueChange={setTab} className="">
              <TabsList className="flex gap-4 overflow-x-auto">
                <TabsTrigger value="subtasks" className={clsx({ 'border-b-3': tab == 'subtasks', 'mb-1': tab !== 'subtasks' })}>Podúlohy</TabsTrigger>
                <TabsTrigger value="reminders" className={clsx({ 'border-b-3': tab == 'reminders', 'mb-1': tab !== 'reminders' })}>Pripomienky</TabsTrigger>
                <TabsTrigger value="comments" className={clsx({ 'border-b-3': tab == 'comments', 'mb-1': tab !== 'comments' })}>Komentáre</TabsTrigger>
                <TabsTrigger value="updates" className={clsx({ 'border-b-3': tab == 'updates', 'mb-1': tab !== 'updates' })}>História</TabsTrigger>
                <TabsTrigger value="files" className={clsx({ 'border-b-3': tab == 'files', 'mb-1': tab !== 'files' })}>Prílohy</TabsTrigger>
              </TabsList>
              {/* <div className="mt-5"> */}
              <TabsContent value="subtasks">
                <SubTasksOverview task={task.data} />
              </TabsContent>
              <TabsContent value="reminders">
                <TaskRemindersOverview task={task.data}></TaskRemindersOverview>
              </TabsContent>
              <TabsContent value="comments">
                <TaskCommentsOverview task={task.data}></TaskCommentsOverview>
              </TabsContent>
              <TabsContent value="updates">
                <TaskUpdatesOverview task={task.data}></TaskUpdatesOverview>
              </TabsContent>
              <TabsContent value="files">
                <TaskAttachmentsOverview task={task.data}></TaskAttachmentsOverview>
              </TabsContent>

              {/* </div> */}
            </Tabs>


          </>
        )
      }
    </>
  )
}


function SubTasksOverview({ task }: { task: Task }) {
  return (
    <>
      <div className="flex justify-between items-center ">
        <h2 className="text-lg">Podriadené úlohy</h2>
        <Link href={`/tasks/create?parent_id=${task.id}`}><AddButton>Vytvoriť pod úlohu</AddButton></Link>
      </div>
      <div className="mt-5">
        <TasksTable defaultFilters={[{ id: 'parent_id', value: task.id }]}></TasksTable>
      </div>
    </>
  )
}

function TaskSettings({ task }: { task: TaskDetailT }) {


  return (
    <>
      <Dialog>
        <DialogTrigger asChild>
          <Button variant={'ghost'} size={'icon'}>
            <SettingsIcon/>
          </Button>
        </DialogTrigger>
        <DialogContent onInteractOutside={(e) => e.preventDefault()} className="w-screen h-screen lg:h-auto lg:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Nastavenia úlohy</DialogTitle>
            <DialogDescription>

            </DialogDescription>
          </DialogHeader>
          <div>
            <div className="flex items-center space-x-2">
              <Checkbox id="terms" />
              <Label
                htmlFor="terms"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Vyžadovať kontrolu dokončenia úlohy
              </Label>
            </div>

          </div>
          {/* <DialogFooter>
          <Button variant="secondary" type="submit" onClick={() => setOpen(false)}>Zrušiť</Button>
          <Button type="submit" >Uložiť</Button>
        </DialogFooter> */}
        </DialogContent>
      </Dialog>
    </>
  )
}