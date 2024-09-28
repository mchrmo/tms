'use client'

import { getUserByClerkId } from "@/lib/db/user.repository";
import ViewHeadline from "@/components/common/view-haedline";
import MyTasks from "../tasks/my-tasks";
import { auth } from "@clerk/nextjs/server";
import { getTaskList } from "@/lib/db/task.repository";
import SendReportButton from "../common/buttons/sendReportButton";
import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  Title,
  CategoryScale,
  LinearScale,
} from 'chart.js';
import { TASK_STATUSES_MAP } from "@/lib/models/task.model";
import { formatDate } from "@/lib/utils/dates";
import { useRouter } from "next/navigation";

// Register necessary Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend, Title, CategoryScale, LinearScale);

export default function EmpDashboard() {


  const taskStatusData = {
    labels: [TASK_STATUSES_MAP.DONE, TASK_STATUSES_MAP.WAITING, TASK_STATUSES_MAP.INPROGRESS, TASK_STATUSES_MAP.CHECKREQ, TASK_STATUSES_MAP.DONE], // TaskStatus enum
    datasets: [
      {
        data: [
          7,
          0,
          4,
          2,
          10,
        ],
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'], // You can adjust the colors as needed
        hoverBackgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'],
      },
    ],
  };

  const nextMeeting = {
    name: "28. Porada vedenia mesta",
    date: new Date()
  }

  const unfinishedTasksCount = {
    owned: 3,
    assigned: 1
  }

  const remindersCount = {
    today: 2,
    nextDay: 7
  }

  const deadlinesCount = {
    today: 0,
    nextDay: 1
  }

  const router = useRouter()

  return (
    <>
      <div >
        <ViewHeadline>Prehľad</ViewHeadline>



        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 py-8 " >
          {/* Next Meeting Widget */}
          <div className="bg-white shadow-md rounded-lg p-6 hover:shadow-xl cursor-pointer" onClick={() => router.push('/meetings')}>
            <h3 className="text-lg font-semibold mb-2">Najbližšia porada</h3>
            {nextMeeting ? (
              <p className="text-gray-700">
                {formatDate(nextMeeting.date)} - {nextMeeting.name}
              </p>
            ) : (
              <p className="text-gray-500">No upcoming meetings</p>
            )}
          </div>

          {/* Not Finished Tasks Widget */}
          <div className="bg-white shadow-md rounded-lg p-6 hover:shadow-xl cursor-pointer" onClick={() => router.push('/tasks')}>
            <h3 className="text-lg font-semibold mb-2">Nedokončené úlohy</h3>
            <p className="text-gray-700">Moje: {unfinishedTasksCount?.owned ?? 0}</p>
            <p className="text-gray-700">Delegované: {unfinishedTasksCount?.assigned ?? 0}</p>
          </div>

          {/* Reminders Widget */}
          <div className="bg-white shadow-md rounded-lg p-6 hover:shadow-xl">
            <h3 className="text-lg font-semibold mb-2">Pripomienky úloh</h3>
            <p className="text-gray-700">Dnes: {remindersCount?.today ?? 0}</p>
            <p className="text-gray-700">Zajtra: {remindersCount?.nextDay ?? 0}</p>
          </div>

          {/* Deadlines Widget */}
          <div className="bg-white shadow-md rounded-lg p-6 hover:shadow-xl cursor-pointer" onClick={() => router.push('/tasks')}>
            <h3 className="text-lg font-semibold mb-2">Termíny</h3>
            <p className="text-gray-700">Dnes: {deadlinesCount?.today ?? 0}</p>
            <p className="text-gray-700">Zajtra: {deadlinesCount?.nextDay ?? 0}</p>
          </div>

          {/* Donut Chart for Task Status */}
          <div className="bg-white shadow-md rounded-lg p-6 col-span-1 lg:col-span-full ">
            <h3 className="text-lg font-semibold mb-2">Prehľad rozpracovania úloh</h3>
            <Doughnut data={taskStatusData} className="max-h-64"/>
          </div>
        </div>
        <div className="flex space-x-3">
          <SendReportButton morning={true}></SendReportButton>
          <SendReportButton morning={false}></SendReportButton>
        </div>

      </div>
    </>
  );
}
