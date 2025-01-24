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
import { formatDate, formatDateShort } from "@/lib/utils/dates";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import LoadingSpinner from "../ui/loading-spinner";
import { useEffect, useState } from "react";
import Link from "next/link";
import AddButton from "../common/buttons/add-button";
import { AlarmClock, CalendarDate, Check, CheckSquareBroken, Flag01 } from "@untitled-ui/icons-react";
import { Skeleton } from "../ui/skeleton";
import { format } from "date-fns";
import DashboardWidgetBox from "./widget";

// Register necessary Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend, Title, CategoryScale, LinearScale);

type DashboardStats = {
  nextMeeting: {
    id: number,
    name: string,
    date: string
  },
  taskStatusCounts: {
    TODO: number,
    WAITING: number,
    INPROGRESS: number,
    CHECKREQ: number,
    DONE: number
  },
  unfinishedTasksCount: {
    owned: number,
    assigned: number
  },
  toCheckCount: number
}

export default function EmpDashboard() {

  const [isTasks, setIsTasks] = useState(false)

  const fetchDashboardData = async () => {
    const response = await fetch('/api/reports/dashboard');
    if (!response.ok) {
      throw new Error('Error fetching dashboard data');
    }
    return response.json();
  };

  const { data, isLoading } = useQuery<DashboardStats>({
    queryKey: ['dashboardData'],
    queryFn: fetchDashboardData
  });



  useEffect(() => {
    if (!data) return
    setIsTasks(Object.values(data.taskStatusCounts as { TODO: number, CHECKREQ: number, DONE: number }).some(v => v > 0))

  }, [data])


  const taskStatusData = {
    labels: [TASK_STATUSES_MAP.TODO, TASK_STATUSES_MAP.WAITING, TASK_STATUSES_MAP.INPROGRESS, TASK_STATUSES_MAP.CHECKREQ], // TaskStatus enum
    datasets: [
      {
        data: data ? [
          data.taskStatusCounts?.TODO ?? 0,
          data.taskStatusCounts?.WAITING ?? 0,
          data.taskStatusCounts?.INPROGRESS ?? 0,
          data.taskStatusCounts?.CHECKREQ ?? 0,
          // data.taskStatusCounts?.DONE ?? 0,
        ] : [0, 0, 0, 0, 0],
        backgroundColor: ['#FBACF8', '#B0B0B0', '#A6E9FB', '#A3C3FE'], // You can adjust the colors as needed
        hoverBackgroundColor: ['#FBACF8', '#B0B0B0', '#FFCE56', '#A3C3FE'],
      },
    ],
  };


  return (
    <>
      <div >
        <span className="col-span-3"></span>
        <div className="flex justify-between  items-start">
          <div className="space-y-1 flex flex-col">
            <h1 className="text-3xl font-bold text-gray-800">Vitajte späť!</h1>
            <span className="text-muted-foreground">Tu nájdete prehľad vašich úloh, porád a pripomienky od vašich kolegov.</span>
          </div>
          <Link href={'/tasks/create'}><AddButton>Nová úloha</AddButton></Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-6 gap-4 mt-10">

          <DashboardWidgetBox title="Najbližšia porada" colspan={2} icon={<CalendarDate height={20} />}>
            {
              isLoading ? <Skeleton className="p-8 rounded-sm w-full" /> :
                (
                  data?.nextMeeting ?
                    <Link href={`/meetings/${data.nextMeeting.id}`} className="w-full">
                      <div className="bg-violet-100 hover:shadow-md cursor-pointer border-l-8 border-violet-600 p-2 ps-6 mt-3 rounded-sm w-full">
                        <span>{data.nextMeeting.name}</span>
                        <div className="mt-1">
                          <p className="font-semibold">{formatDateShort(new Date(data.nextMeeting.date))}</p>
                          <span className="">{format(data.nextMeeting.date, 'HH:mm')}</span>
                        </div>
                      </div>
                    </Link>
                    :
                    <div className="flex flex-col justify-center items-center w-full">
                      <Check width={30} height={30} className="text-green-700" />
                      <span>Nečakajú na Vás žiadne porady</span>
                    </div>
                )
            }
          </DashboardWidgetBox>

          <DashboardWidgetBox title="Nedokončené úlohy" colspan={2} icon={<CheckSquareBroken height={20} />}>
            <div className="mt-4 gap-2 flex flex-col w-full">
              {
                isLoading ?
                  <>
                    <Skeleton className="p-4 rounded-sm w-full" />
                    <Skeleton className="p-4 rounded-sm w-full" />
                  </>
                  :
                  <>
                    <Link href="/tasks/unfinished">
                      <div className="bg-[#FFF4FF] border-1 border-[#FDD0FE] rounded-md p-2 flex justify-between hover:shadow-md cursor-pointer" >
                        <span className="text-sm text-[#741B6A]">Moje úlohy</span>
                        <span className="text-lg text-[#EC35E4] font-semibold">{data?.unfinishedTasksCount.owned}</span>
                      </div>
                    </Link>
                    <Link href="/tasks/delegated">
                      <div className="bg-[#ECFCFF] border-1 border-[#A6E9FB] rounded-md p-3 flex justify-between hover:shadow-md cursor-pointer">
                        <span className="text-sm text-[#174662]">Delegované úlohy</span>
                        <span className="text-lg text-[#099FD1] font-semibold">13</span>
                      </div>
                    </Link>
                  </>
              }
            </div>
          </DashboardWidgetBox>

          <DashboardWidgetBox title="Čaká na kontrolu" colspan={2} icon={<AlarmClock height={20} />}>
            {
              isLoading ? <Skeleton className="p-8 rounded-sm w-full" /> :
                (
                  data!.toCheckCount == 0 ?
                  <div className="flex flex-col justify-center items-center w-full">
                    <Check width={30} height={30} className="text-green-700" />
                    <span>Nemáte žiadne úlohy na kontrolu</span>
                  </div>
                  :
                  <div className="flex flex-col justify-center items-center w-full">
                    {/* <Check width={30} height={30} className="text-green-700" /> */}
                    <Link href={'/tasks/delegeted'}><span className=" text-[#e29400] hover:underline text-large">Skontrolovať <span className="font-semibold">{data!.toCheckCount}</span> úloh</span></Link>
                  </div>
                )
            }

          </DashboardWidgetBox>


          <DashboardWidgetBox title="Stav mojich úloh" colspan={3} icon={<CalendarDate height={20} />}>
            <div className="w-full mt-4">
              {
                isTasks ? <Doughnut data={taskStatusData} options={{ plugins: { legend: { position: 'right' } } }} className="max-h-64" /> : <p className="text-gray-500">Pridajte prvú úlohu</p>
              }
            </div>
          </DashboardWidgetBox>

          <DashboardWidgetBox title="Pripomienky" colspan={3} icon={<Flag01 height={20} />}>
            <div className="flex flex-col justify-center items-center w-full">
              <Check width={30} height={30} className="text-green-700" />
              <span>Nečakajú na Vás žiadne pripomienky</span>
            </div>
          </DashboardWidgetBox>


        </div >

      </div >
    </>
  );
}

