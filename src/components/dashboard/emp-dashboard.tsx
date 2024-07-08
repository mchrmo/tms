import { getUserByClerkId } from "@/lib/db/user.repository";
import ViewHeadline from "../common/view-haedline";
import MyTasks from "../tasks/my-tasks";
import { auth } from "@clerk/nextjs/server";
import { getTaskList } from "@/lib/db/task.repository";

export default async function EmpDashboard() {




  return (
    <>
      <div >
        <ViewHeadline>Prehľad</ViewHeadline>
        
        
        <MyTasks ></MyTasks>
      </div>
    </>
  );
}
