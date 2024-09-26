import { getUserByClerkId } from "@/lib/db/user.repository";
import ViewHeadline from "@/components/common/view-haedline";
import MyTasks from "../tasks/my-tasks";
import { auth } from "@clerk/nextjs/server";
import { getTaskList } from "@/lib/db/task.repository";
import SendReportButton from "../common/buttons/sendReportButton";

export default async function EmpDashboard() {




  return (
    <>
      <div >
        <ViewHeadline>Prehľad</ViewHeadline>
        <MyTasks></MyTasks>

        <div className="flex space-x-3">
          <SendReportButton morning={true}></SendReportButton>
          <SendReportButton morning={false}></SendReportButton>
        </div>

      </div>
    </>
  );
}
