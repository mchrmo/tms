
import ViewHeadline from "@/components/common/view-haedline";
import TaskDetail from "@/components/tasks/detail";

export default async function Task({ params }: {params: {id: string}}) {


  


  return (
    <>
      <ViewHeadline>Detail úlohy</ViewHeadline>

      <TaskDetail params={params}></TaskDetail>
    </>
  )
}

