import { NextRequest, NextResponse } from "next/server";
import reportService from "../services/report.service";
import { ApiError } from "next/dist/server/api-utils";



const processReports = async (req: NextRequest) => {
  const body = await req.json()

  if(!body.type) throw new ApiError(400, "Missing type")

  if(!['afternoon', 'morning'].includes(body.type)) throw new ApiError(400, "Wrong type")

  await reportService.process_reports(body.type)

  return NextResponse.json({ status: 200 })
}



const reportsController = {
  processReports
}

export default reportsController