'use client'

import { Button } from "@/components/ui/button";



export default function SendReportButton({morning}: {morning: boolean}) {


  const fetchData = async () => {
    const req = await fetch(process.env.NEXT_PUBLIC_URL + `/api/reports?type=${morning ? "morning" : "afternoon"}`, {method: "GET"});
    const newData = await req.json();
};

  const handleClick = (event: any) => {
      event.preventDefault();
      fetchData();
  };

  return <Button variant={'secondary'} onClick={handleClick}>{morning ? 'Ranný' : 'Poobedný'} report</Button>
}