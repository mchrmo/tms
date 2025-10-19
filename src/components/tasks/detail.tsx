'use client'
import { useDeleteTask, useTask, useUpdateTaskMeta } from "@/lib/hooks/task/task.hooks";
import { Task, TaskUserRole } from "@prisma/client";
import ViewHeadline from "@/components/common/view-haedline";
import TaskForm from "./task-form";
import LoadingSpinner from "@/components/ui/loading-spinner";
import TasksTable from "./table";
import Link from "next/link";
import { Label } from "@/components/ui/label";
import TaskRemindersOverview from "./reminders/taskReminders-overview";
import AddButton from "@/components/common/buttons/add-button";
import TaskUpdatesOverview from "./updates/taskUpdates-overview";
import { useEffect, useState } from "react";
import clsx from "clsx";
import { TabsTrigger, Tabs, TabsContent, TabsList } from "@/components/ui/tabs";
import TaskCommentsOverview from "./comments/taskComments-overview";
import TaskAttachmentsOverview from "./attachments/taskAttachments-overview";
import { TaskDetail as TaskDetailT } from "@/lib/services/tasks/task.service";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { BadgeAlert, ListTreeIcon, PaperclipIcon, SettingsIcon } from "lucide-react";
import { Checkbox } from "../ui/checkbox";
import { Button } from "../ui/button";
import { useUser } from "@clerk/nextjs";
import { isRole } from "@/lib/utils";
import { User } from "@clerk/nextjs/server";
import { useRouter } from "next/navigation";
import { getMetaValue } from "@/lib/utils/api.utils";
import TaskDetailSidebar from "./detail/sidebar";
import { Spinner } from "../ui/spinner";


export default function TaskDetail({ params }: { params: { id: string } }) {

  const taskId = parseInt(params.id)
  const taskQ = useTask(taskId)
  const task: TaskDetailT | undefined = taskQ.data ? taskQ.data.data : undefined
  const taskRole = taskQ.data ? taskQ.data.role : undefined
  // const parent = useTask((task && task.parent_id) ? task.parent_id : undefined)

  const deleteTaskQ = useDeleteTask();
  const [tab, setTab] = useState('files')

  const { user } = useUser()
  const isAdmin = isRole((user as unknown) as User, 'admin')
  const router = useRouter()


  const onDelete = () => {
    deleteTaskQ.mutate({ taskId })
  }

  useEffect(() => {
    if (deleteTaskQ.isSuccess) router.push('/tasks')
  }, [deleteTaskQ.isSuccess])


  if (taskQ.isFetching) return <div className="h-screen  flex items-center justify-center">
    <span><Spinner className="size-20 text-[#7b75f9]" /></span>
  </div>


  return (
    <>
      {taskQ.error instanceof Error && <div>{taskQ.error.message}</div>}

      {
        <div className="flex flex-col h-screen ">
          {/* Topbar */}
          <div className="flex justify-between border-b py-2 px-8 items-center">
            <h1 className="font-semibold text-base p-0">Detail úlohy</h1>
            <div className="">
              {
                task && taskRole &&
                <>
                  {/* <Button onClick={() => setVariant(variant == 'ghost' ? 'default' : 'ghost')} variant={variant} size={'icon'}>
                      <EyeIcon />
                    </Button> */}
                  <TaskSettings task={task} role={taskRole} />
                </>
              }
            </div>
          </div>

          {/* Main content */}
          {
            task && taskRole && (
              <div className="flex gap-6 overflow-hidden flex-grow">
                <div className="flex flex-col flex-grow gap-5 pl-8 pt-6">
                  {/* {
                    task.parent && <Label className="text-md">
                      Úloha podradená pod úlohu: <Link className="link" href={`/tasks/${task.parent.id}`}>{task.parent.name}</Link>
                    </Label>
                  } */}
                  <TaskForm defaultValues={task} role={taskRole}></TaskForm>

                  <div className="border-t "></div>

                  {/* Sub Items */}
                  <div>
                    <div className="flex gap-5">
                      <SubmenuNavigationButton onClick={() => setTab('files')} isActive={tab === 'files'} icon={<PaperclipIcon size={12} />} label="Prílohy" count={task._count.attachments} countClasses="bg-[#FDD0FE] text-magenta" />
                      <SubmenuNavigationButton onClick={() => setTab('subtasks')} isActive={tab === 'subtasks'} icon={<ListTreeIcon size={12} />} label="Podúlohy" count={task._count.SubTasks} countClasses="bg-[#888888] text-white" />
                      <SubmenuNavigationButton onClick={() => setTab('reminders')} isActive={tab === 'reminders'} icon={<BadgeAlert size={12} />} label="Pripomienky" count={task._count.Reminders} countClasses="bg-[#FDD0FE] text-magenta" />
                    </div>
                  </div>

                  <Tabs value={tab} onValueChange={setTab} className="">
                    <TabsContent value="reminders">
                      <TaskRemindersOverview task={task}></TaskRemindersOverview>
                    </TabsContent>
                    <TabsContent value="files">
                      <TaskAttachmentsOverview task={task}></TaskAttachmentsOverview>
                    </TabsContent>
                  </Tabs>

                  {isAdmin && <Button onClick={onDelete} variant={"linkDestructive"}>Vymazať úlohu</Button>}
                </div>
                <>
                  <TaskDetailSidebar task_id={task.id} taskUpdates={task.taskUpdates} taskComments={task.taskComments}></TaskDetailSidebar>
                </>
              </div>
            )}

        </div>
      }
    </>
  )
}


function TaskSettings({ task, role }: { task: TaskDetailT, role: TaskUserRole }) {

  const updateMetaQ = useUpdateTaskMeta()


  if (!task) return <></>

  let requiredCheck = false
  const checkReqMeta = getMetaValue(task.meta, 'checkRequired')
  if (checkReqMeta) {
    requiredCheck = (checkReqMeta === "true")
  }

  return (
    <>
      <Dialog>
        <DialogTrigger asChild>
          <Button variant={'ghost'} size={'icon'}>
            <SettingsIcon />
          </Button>
        </DialogTrigger>
        <DialogContent className="w-screen lg:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Nastavenia úlohy</DialogTitle>
          </DialogHeader>

          <div>
            <div className="flex items-center space-x-2">
              <Checkbox defaultChecked={requiredCheck} onCheckedChange={(checked) => updateMetaQ.mutate({ key: 'checkRequired', value: checked.toString(), taskId: task.id })} id="terms" disabled={!['OWNER', 'PERSONAL'].includes(role)} />
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


function SubmenuNavigationButton(props: { isActive: boolean, icon: React.ReactNode, label: string, count?: number, countClasses: string, onClick?: () => void }) {


  return (
    <div onClick={props.onClick} className={`h-9 flex items-center gap-2 px-3  rounded-md hover:bg-gray-100 cursor-pointer ${props.isActive ? 'bg-[#E7E7E7]' : ''}`}>
      {props.icon}
      <span>{props.label}</span>
      {
        (props.count && props.count > 0) ? (
          <div className={`text-xs ${props.countClasses} w-5 h-5 rounded-full font-semibold flex items-center justify-center`}>{props.count}</div>
        ) : null
      }

    </div>
  )
}