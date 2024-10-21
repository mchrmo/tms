import prisma from "@/lib/prisma";
import { errorHandler } from "@/lib/services/api.service";
import { NextRequest, NextResponse } from "next/server";


export const DELETE = errorHandler( async (req: NextRequest, params: any) => {
  const id = parseInt(params!.id)

  await prisma.taskAttachment.delete({where: {
    id: id
  }})


  return NextResponse.json({ error: "File deleted" }, { status: 200 });
})