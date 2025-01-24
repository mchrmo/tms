import { errorHandler } from "@/lib/services/api.service";
import fileService from "@/lib/services/file.service";
import userService from "@/lib/services/user.service";
import { ApiError } from "next/dist/server/api-utils";
import { NextRequest, NextResponse } from "next/server";

export const GET = errorHandler(async (req: NextRequest) => {
    const user = await userService.get_current_user();
    if(!user) throw new ApiError(403, "No user")

    const {size, docs} = await fileService.getBucketSize()

    const reports = {
        size, docs
    };
  
    return NextResponse.json(reports, { status: 200 })
  })