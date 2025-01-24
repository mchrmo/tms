import fileService from "@/lib/services/file.service";
import { NextResponse } from "next/server";

export const GET = async (req: Request) => {
  try {
    const {size, docs} = await fileService.getBucketSize()

    // Respond with the file as a download
    return NextResponse.json({size, docs}, { status: 200 })
  } catch (error) {
    return NextResponse.json({ error: "Failed to get stats" }, { status: 500 });
  }
};
