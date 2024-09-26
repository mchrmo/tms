import reportsController from '@/lib/controllers/reports.controller';
import { getUser } from '@/lib/db/user.repository';
import prisma from '@/lib/prisma';
import { errorHandler } from '@/lib/services/api.service';
import { sendReport } from '@/lib/services/mail.service';
import reportService from '@/lib/services/report.service';
import userService from '@/lib/services/user.service';
import { ApiError } from 'next/dist/server/api-utils';
import { NextRequest, NextResponse } from 'next/server';

export const POST = errorHandler(reportsController.processReports)

export const GET = errorHandler(async (req: NextRequest) => {

  const params = req.nextUrl.searchParams

  let userId = parseInt(params.get('userId')!)

  if(!userId) {
    const user = await userService.get_current_user();
    if(!user) throw new ApiError(403, "No user")
    userId = user?.id
  }

  const user = await prisma.user.findUnique({
    where: {
      id: userId
    },
    include: {
      OrganizationMember: {
        select: { id: true }
      }
    }
  })

  if(!user) return NextResponse.json({message: "User not found"}, { status: 404 })


  const report = await (params.get('type') == 'morning' ? reportService.morning_user_report(user) : reportService.afternoon_user_report(user))
  if(report) await sendReport(user.email, report.title, report.html)

  return new NextResponse(
    report.html,
    { status: 200, headers: { 'content-type': 'text/html' } }
)
// return NextResponse.json({message: "User not found"}, { status: 404 })
})