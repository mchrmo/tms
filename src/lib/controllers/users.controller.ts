import { NextRequest, NextResponse } from "next/server";
import userService, { CurrentUserDetail, UserDetail } from "../services/user.service";
import { ApiError } from "next/dist/server/api-utils";
import { NewUserSchema, passwordSchema, userColumns, userListIncludes } from "../models/user.model";
import { Prisma, User } from "@prisma/client";
import prisma from "../prisma";
import { createPaginator } from 'prisma-pagination'
import { parseGetManyParams } from "../utils/api.utils";






const getUsers = async (req: NextRequest) => {
  const params = req.nextUrl.searchParams
  const {where, orderBy, pagination} = parseGetManyParams(params, userColumns)

  const paginate = createPaginator({ page: pagination.page, perPage: pagination.pageSize })
  const data = await paginate<User, Prisma.UserFindManyArgs>(
    prisma.user,
    {
      where,
      orderBy,
      include: userListIncludes,
    }
  )

  return NextResponse.json(data, { status: 200 })
}



const getUser = async (req: NextRequest, params: any) => {
  const userId = parseInt(params.id)

  let user: UserDetail | CurrentUserDetail;
  if(userId == 0) {
    const currentUser = await userService.get_current_user()
    if(!currentUser) return 
    user = await userService.get_user(currentUser.id)  
  } else user = await userService.get_user(userId)  

  return NextResponse.json(user, { status: 200 })
}

const createUser = async (request: NextRequest) => {

  const body = await request.json()
  const parsedSchema = NewUserSchema.safeParse(body);

  if (!parsedSchema.success) {
    const { errors } = parsedSchema.error;

    return NextResponse.json({
      error: { message: "Invalid request", errors },
    }, {status: 400});
  }

  const {name, email}  = parsedSchema.data

  
  const user = await userService.create_user({name, email})


  return NextResponse.json(user, { status: 200 })
  
};

const changePassword = async (req: NextRequest) => {
  const body = await req.json()

  const {user_id, password} = body

  const parsedSchema = passwordSchema.safeParse(password);

  if (!parsedSchema.success) {
    const { errors } = parsedSchema.error;

    return NextResponse.json({
      error: { message: "Invalid request", errors },
    }, {status: 400});
  }

  const user = await userService.get_user(user_id)
  if(!user) throw new ApiError(404, "User not found")
  
  await userService.set_new_pasword(user.clerk_id, password)

  return NextResponse.json(user, { status: 200 })
}


const usersController = {
  getUsers,
  getUser,
  createUser,
  changePassword
}

export default usersController