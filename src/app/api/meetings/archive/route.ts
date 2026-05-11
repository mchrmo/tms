import prisma from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export const POST = async (req: NextRequest) => {
  console.log('Archiving meetings...')
  const authHeader = req.headers.get('authorization')
  console.log('Received auth header:', authHeader)
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const startOfToday = new Date()
  startOfToday.setHours(0, 0, 0, 0)

  const result = await prisma.meeting.updateMany({
    where: {
      archived: false,
      date: {
        lt: startOfToday,
      },
    },
    data: {
      archived: true,
    },
  })

  return NextResponse.json({ archived: result.count }, { status: 200 })
}
