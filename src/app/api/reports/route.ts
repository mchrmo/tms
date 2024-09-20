import reportsController from '@/lib/controllers/reports.controller';
import { getUser } from '@/lib/db/user.repository';
import prisma from '@/lib/prisma';
import { errorHandler } from '@/lib/services/api.service';
import reportService from '@/lib/services/report.service';
import userService from '@/lib/services/user.service';
import { NextRequest, NextResponse } from 'next/server';

export const POST = errorHandler(reportsController.processReports)

export const GET = async (req: NextRequest) => {

  const user = await prisma.user.findUnique({
    where: {
      id: 8
    },
    include: {
      OrganizationMember: {
        select: { id: true }
      }
    }
  })

  if(!user) return NextResponse.json({message: "User not found"}, { status: 404 })


  const html = await reportService.afternoon_user_report(user)

  return new NextResponse(
    html,
    { status: 200, headers: { 'content-type': 'text/html' } }
)
// return NextResponse.json({message: "User not found"}, { status: 404 })
}