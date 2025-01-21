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
import AddButton from "../common/buttons/add-button";
import { AlarmClock, CalendarDate, CheckSquareBroken, Flag01 } from "@untitled-ui/icons-react";

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
    if (!data) return
    data.taskStatusCounts = data.taskStatusCounts as { TODO: number, CHECKREQ: number, DONE: number }
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

        <div className="flex justify-between  items-start">
          <div className="space-y-1 flex flex-col">
            <h1 className="text-3xl font-bold text-gray-800">Vitajte späť!</h1>
            <span className="text-muted-foreground">Tu nájdete prehľad vašich úloh, porád a pripomienky od vašich kolegov.</span>
          </div>
          <AddButton>Nová úloha</AddButton>
        </div>
        
        <div className="grid grid-cols-6 gap-4 mt-10">

          <DashboardWidgetBox title="Najbližšia porada" colspan={2} icon={<CalendarDate height={20}/>}>

          </DashboardWidgetBox>

          <DashboardWidgetBox title="Nedokončené úlohy" colspan={2} icon={<CheckSquareBroken height={20}/>}>

          </DashboardWidgetBox>

          <DashboardWidgetBox title="Termíny" colspan={2} icon={<AlarmClock height={20}/>}>

          </DashboardWidgetBox>

          
          <DashboardWidgetBox title="Stav mojich úloh" colspan={3} icon={<CalendarDate height={20}/>}>

          </DashboardWidgetBox>

          <DashboardWidgetBox title="Pripomienky" colspan={3} icon={<Flag01 height={20}/>}>

          </DashboardWidgetBox>


        </div>
        
      </div>
    </>
  );
}


type DashboardWidgetBoxProps = {
  children?: React.ReactNode,
  title: string,
  icon?: React.ReactNode,
  link?: string,
  colspan?: number
}

function DashboardWidgetBox(props: DashboardWidgetBoxProps) {

  let colspanClass = `col-span-${props.colspan ?? 2}`

  
  return (
    <div className={`p-4 rounded-md border-1 ${colspanClass}`}>
      <div className="flex space-x-2 items-center">
        <span className="text-gray-600">{props.icon && props.icon}</span>
        <h1 className="text-md font-semibold">{props.title}</h1>
      </div>

    </div>
  )
} 