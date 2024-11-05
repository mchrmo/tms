import usersController from "@/lib/controllers/users.controller";
import { errorHandler } from "@/lib/services/api.service";
import { NextRequest, NextResponse } from "next/server";

export const POST = errorHandler(usersController.changePassword)