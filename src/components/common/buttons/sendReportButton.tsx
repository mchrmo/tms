'use client'

import { Button } from "@/components/ui/button";



export default function SendReportButton() {


  const fetchData = async () => {
    const req = await fetch(process.env.NEXT_PUBLIC_URL + '/api/reports', {method: "POST", body: JSON.stringify({type: "morning"})});
    const newData = await req.json();


};

  const handleClick = (event: any) => {
      event.preventDefault();
      fetchData();
  };

  return <Button onClick={handleClick}>Morning report</Button>
}