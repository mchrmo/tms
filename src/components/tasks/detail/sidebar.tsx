import Avatar from "@/components/common/avatar"
import SubmitButton from "@/components/common/buttons/submit"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useCreateTaskComment, useDeleteTaskComment } from "@/lib/hooks/task/taskComment.hooks"
import { TaskDetail } from "@/lib/services/tasks/task.service"
import { useEffect, useState } from "react"



type TaskDetailSidebarUpdates = Exclude<TaskDetail, null>['taskUpdates'] & { itemType?: 'update' }
type TaskDetailSidebarComments = Exclude<TaskDetail, null>['taskComments'] & { itemType?: 'comment' }

export default function TaskDetailSidebar({
  task_id,
  taskUpdates,
  taskComments
}: {
  task_id: number,
  taskUpdates: TaskDetailSidebarUpdates,
  taskComments: TaskDetailSidebarComments
}) {

  const [newComment, setNewComment] = useState('');
  const createTaskComment = useCreateTaskComment();
  useEffect(() => {
    if (createTaskComment.isSuccess) {
      setNewComment('');
      createTaskComment.reset()
    }
  }, [createTaskComment.isSuccess])


  const items = [...taskUpdates.map(u => ({ ...u, itemType: 'update' })), ...taskComments.map(c => ({ ...c, itemType: 'comment' }))].sort((a, b) => a.createdAt < b.createdAt ? 1 : -1);


  return (
    <div className="min-w-[300px] max-w-[377px] hidden bg-violet-50 border-l lg:flex flex-col " >
     
      {/* Items */}
      <div className="flex flex-col flex-1 gap-6 p-4 overflow-y-auto">
        <div className="flex h-9 items-center gap-1">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M8 10H8.01M12 10H12.01M16 10H16.01M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z" stroke="#0A0A0A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="m-0 font-medium text-sm">Komentáre</span>
        </div>

        {
          items.map((item, index) => item.itemType === 'update' ?
            <UpdateItem update={item as TaskDetailSidebarUpdates[number]} key={index} /> :
            <CommentItem comment={item as TaskDetailSidebarComments[number]} task_id={task_id} key={index} />)
        }

      </div>

      {/* New Comment Form */}
      <div className="flex-shrink-0 p-4">
        <div className="pt-6 border-t">
          <form className="flex gap-2" onSubmit={(event) => {
            event.preventDefault();
            createTaskComment.mutate({ message: newComment, task_id });
          }}>
            <Input type="textarea" value={newComment} onChange={(event) => setNewComment(event.target.value)} placeholder="Napíšte komentár" />
            <SubmitButton isLoading={createTaskComment.isPending} type="submit">Odoslať</SubmitButton>
          </form>
        </div>
      </div>
    </div>
  )

}


function CommentItem({ comment, task_id }: { comment: TaskDetailSidebarComments[number], task_id: number }) {

  const [isDeleting, setIsDeleting] = useState(false);

  const deleteQuery = useDeleteTaskComment(comment.id, task_id);

  useEffect(() => {
    if (deleteQuery.isSuccess) {

    }
  }, [deleteQuery.isSuccess]);

  return (
    <div>
      <div className="flex flex-col bg-white p-3 gap-2 border rounded-md">
        <div className="flex justify-between">
          <div className="flex items-center gap-2">
            <Avatar name={comment.user?.name} size="sm" />
            <span className="font-medium text-[#4F4F4F]">{comment.user?.name}</span>
          </div>
          <span className="text-[#888888] text-sm">
            {new Date(comment.createdAt).toLocaleDateString('sk-SK', {
              day: 'numeric',
              month: 'numeric',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            }).replace(',', ' o')}
          </span>
        </div>
        <span className="text-sm">{comment.message}</span>
      </div>
      <div className=" text-xs block text-right mt-1">

        {

          deleteQuery.isPending ? <>
            <span className=" text-red-500">Odstraňuje sa...</span>
          </> :
            (
              isDeleting ? (
                <div className="flex flex-col">
                  <div>Určite chcete odstrániť komentár?</div>
                  <div className="flex gap-1 justify-end">
                    <span className="hover:underline cursor-pointer text-red-500" onClick={() => deleteQuery.mutate()}>Áno</span>
                    <span className="hover:underline cursor-pointer" onClick={() => setIsDeleting(false)}>Nie</span>
                  </div>
                </div>
              ) : (
                <span className="hover:underline cursor-pointer text-red-500" onClick={() => setIsDeleting(true)}>Odstrániť</span>
              )
            )
        }
      </div>
    </div>
  )
}

function UpdateItem({ update }: { update: TaskDetailSidebarUpdates[number] }) {

  return (
    <div className="flex justify-between gap-1 text-xs text-[#3C618D]">
      <span>{update.description}</span>
      <span className="whitespace-nowrap">{new Date(update.createdAt).toLocaleDateString()}</span>
    </div>
  )
}