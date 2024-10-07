import { NextRequest, NextResponse } from "next/server";
import { getParams, paginate, parseFilter, parseQueryParams } from "../services/api.service";
import { Prisma } from "@prisma/client";
import userService, { CurrentUserDetail, UserDetail } from "../services/user.service";
import { ApiError } from "next/dist/server/api-utils";
import { TaskUpdateSchema } from "../models/task.model";
import { NewUserSchema, passwordSchema } from "../models/user.model";
import { auth } from "@clerk/nextjs/server";



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

const getUsers = async (req: NextRequest) => {

  const params = req.nextUrl.searchParams
  const {
    pagination: {page, pageSize},
    filters,
    order
  } = parseQueryParams(params)

  const where: Prisma.UserWhereInput = parseFilter(filters, {name: 'string', email: 'string', id: 'number'})
  if('clerk_id' in filters) {
    where.clerk_id = {
      contains: filters['clerk_id']
    }
  }

  const data = await paginate({
    modelName: 'User',
    page,
    pageSize,
    where,
    orderBy: order,
    include: {
      role: true,
      OrganizationMember: {
        select: {
          organization_id: true,
          organization: {
            select: {
              name: true
            }
          }
        }
      }
    } as any
  })
  

  return NextResponse.json(data, { status: 200 })
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