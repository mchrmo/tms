import { getUserByClerkId } from "@/lib/db/user.repository";
import fileService from "@/lib/services/file.service";
import { errorHandler } from "@/lib/services/api.service";
import { auth } from "@clerk/nextjs/server";
import { ApiError } from "next/dist/server/api-utils";
import { NextResponse } from "next/server";


const allowedRefs = ['task', 'meetingItem']

export const POST = errorHandler(async (req: Request) => {
  const formData = await req.formData();
  const file: any = formData.get("file");
  const name: any = formData.get("name");
  const refName: any = formData.get('ref')
  const refId: any = formData.get('refId')
  
  if(!file) {
    throw new ApiError(400, "File is missing")
  }

  if(!refName || !refId) throw new ApiError(400, "Ref or RefId is not correct")
  if(!allowedRefs.includes(refName)) throw new ApiError(400, "Ref not allowed")

  const userId = auth().userId
  if(!userId) return NextResponse.json({error: "Access denied."}, {status: 401})
  const user = await getUserByClerkId(userId)

  
  const ref = {
    id: parseInt(refId),
    model: refName
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = new Uint8Array(arrayBuffer);

  const path = await fileService.uploadFile(file.name, file.type, buffer)

  
  const newFile = await fileService.createFile(
    name, file.type, path, user?.id!, ref 
  )


  return NextResponse.json(newFile, { status: 200 })
})


export const GET = async (req: Request) => {
  try {
    const url = new URL(req.url);
    const fileName = url.searchParams.get("file");

    
    if (!fileName) {
      return NextResponse.json({ error: "File name is required" }, { status: 400 });
    }

    const {buffer, type} = await fileService.getFile(fileName)

    // Respond with the file as a download
    return new Response(buffer, {
      headers: {
        "Content-Type": type || "application/octet-stream",
        "Content-Disposition": `attachment; filename="${fileName}"`,
      },
    });
  } catch (error) {
    console.error("Error downloading file:", error);
    return NextResponse.json({ error: "Failed to download file" }, { status: 500 });
  }
};


