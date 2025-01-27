'use client'

import DashboardWidgetBox from "./widget";
import { Box } from "lucide-react";
import { Skeleton } from "../ui/skeleton";
import { useQuery } from "@tanstack/react-query";


export default function AdminDashboard() {


  const fetchDashboardData = async () => {
    const response = await fetch('/api/reports/dashboard/admin');
    if (!response.ok) {
      throw new Error('Error fetching dashboard data');
    }
    return response.json();
  };

  const { data, isLoading } = useQuery<{ docs: number, size: number }>({
    queryKey: ['dashboardData'],
    queryFn: fetchDashboardData
  });

  return (
    <>
      <span className="col-span-6"></span>
      <div className="flex justify-between  items-start">
        <div className="space-y-1 flex flex-col">
          <h1 className="text-3xl font-bold text-gray-800">Vitajte späť!</h1>
          <span className="text-muted-foreground">Nachádzate s v administrácií aplikácie Task Manager.</span>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-6 gap-4 mt-10">
        <DashboardWidgetBox title="Využitie cloudového priestoru" colspan={6} icon={<Box height={20} />}>
          {
            isLoading ? <Skeleton className="p-8 rounded-sm w-full mt-3" /> :
              (
                <div className="flex flex-col w-full">
                  <div className="bg-violet-100 hover:shadow-md border-l-8 border-violet-600 p-2 ps-6 mt-3 rounded-sm w-full">
                    <span>Celkom využitý priestor:</span>
                    <span className="ms-5 font-semibold">
                      {Math.max((data?.size! / (1024 ** 3)), 0.01).toFixed(2)}/500GB
                    </span>
                  </div>
                  <div className="bg-violet-100 hover:shadow-md border-l-8 border-violet-600 p-2 ps-6 mt-3 rounded-sm w-full">
                    <span>Celkový počet súborov:</span>
                    <span className="ms-5  font-semibold">
                      {(data?.docs!)}
                    </span>
                  </div>
                </div>
              )
          }
        </DashboardWidgetBox>
      </div>

    </>
  );
}
