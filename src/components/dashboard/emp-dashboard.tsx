'use client'

import { getUserByClerkId } from "@/lib/db/user.repository";
import ViewHeadline from "@/components/common/view-haedline";
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
import { useQuery } from "@tanstack/react-query";
import LoadingSpinner from "../ui/loading-spinner";
import { useEffect, useState } from "react";
import Link from "next/link";

// Register necessary Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend, Title, CategoryScale, LinearScale);

export default function EmpDashboard() {

  const [isTasks, setIsTasks] = useState(false)
  const router = useRouter()

  const fetchDashboardData = async () => {
    const response = await fetch('/api/reports/dashboard');
    if (!response.ok) {
      throw new Error('Error fetching dashboard data');
    }
    return response.json();
  };

  const { data, isLoading } = useQuery({
    queryKey: ['dashboardData'],
    queryFn: fetchDashboardData
  });

  

  useEffect(() => {
    if(!data) return
    data.taskStatusCounts = data.taskStatusCounts as {TODO: number, CHECKREQ: number, DONE: number}
    setIsTasks(Object.values(data.taskStatusCounts as {TODO: number, CHECKREQ: number, DONE: number}).some(v => v > 0))

  }, [data])


  const taskStatusData = {
    labels: [TASK_STATUSES_MAP.DONE, TASK_STATUSES_MAP.WAITING, TASK_STATUSES_MAP.INPROGRESS, TASK_STATUSES_MAP.CHECKREQ, TASK_STATUSES_MAP.DONE], // TaskStatus enum
    datasets: [
      {
        data: data ? [
          data.taskStatusCounts?.TODO ?? 0,
          data.taskStatusCounts?.WAITING ?? 0,
          data.taskStatusCounts?.INPROGRESS ?? 0,
          data.taskStatusCounts?.CHECKREQ ?? 0,
          data.taskStatusCounts?.DONE ?? 0,
        ] : [0,0,0,0,0],
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'], // You can adjust the colors as needed
        hoverBackgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'],
      },
    ],
  };


  return (
    <>
      <div >
        <ViewHeadline>Prehľad</ViewHeadline>


        {
          isLoading ?
            <LoadingSpinner></LoadingSpinner>
          : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 py-8 " >
            {/* Next Meeting Widget */}
            <div className="bg-white shadow-md rounded-lg p-6 hover:shadow-xl " >
              <h3 className="text-lg font-semibold mb-2">Najbližšia porada</h3>
              {data.nextMeeting ? (
                <Link href={`/meetings/${data.nextMeeting.id}`}><p className="text-gray-700 cursor-pointer">
                {formatDate(data.nextMeeting.date)} - {data.nextMeeting.name}
              </p></Link>
              ) : (
                <p className="text-gray-500">Žiadna naplánovaná porada</p>
              )}
            </div>
  
            {/* Not Finished Tasks Widget */}
            <div className="bg-white shadow-md rounded-lg p-6 hover:shadow-xl cursor-pointer" onClick={() => router.push('/tasks')}>
              <h3 className="text-lg font-semibold mb-2">Nedokončené úlohy</h3>
              <p className="text-gray-700">Mne delegované: {data.unfinishedTasksCount?.owned ?? 0}</p>
              <p className="text-gray-700">Mnou delegované: {data.unfinishedTasksCount?.assigned ?? 0}</p>
            </div>
  
            {/* Reminders Widget */}
            <div className="bg-white shadow-md rounded-lg p-6 hover:shadow-xl">
              <h3 className="text-lg font-semibold mb-2">Pripomienky úloh</h3>
              <p className="text-gray-700">Dnes: {data.remindersCount?.today ?? 0}</p>
              <p className="text-gray-700">Zajtra: {data.remindersCount?.nextDay ?? 0}</p>
            </div>
  
            {/* Deadlines Widget */}
            <div className="bg-white shadow-md rounded-lg p-6 hover:shadow-xl cursor-pointer" onClick={() => router.push('/tasks')}>
              <h3 className="text-lg font-semibold mb-2">Termíny</h3>
              <p className="text-gray-700">Dnes: {data.deadlinesCount?.today ?? 0}</p>
              <p className="text-gray-700">Zajtra: {data.deadlinesCount?.nextDay ?? 0}</p>
            </div>
  
            {/* Donut Chart for Task Status */}
            <div className="bg-white shadow-md rounded-lg p-6 col-span-full ">
              <h3 className="text-lg font-semibold mb-2">Prehľad rozpracovania úloh</h3>
              {
                isTasks ? <Doughnut data={taskStatusData} className="max-h-64"/> : <p className="text-gray-500">Pridajte prvú úlohu</p>
              }
              
            </div>
          </div>
          )

        }
        {/* <div className="flex space-x-3">
          <SendReportButton morning={true}></SendReportButton>
          <SendReportButton morning={false}></SendReportButton>
        </div> */}

      </div>
    </>
  );
}
