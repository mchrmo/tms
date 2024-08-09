import { NextRequest, NextResponse } from "next/server";
import { getParams, paginate, parseFilter, parseQueryParams } from "../services/api.service";
import { Prisma } from "@prisma/client";



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
  // console.log(filters, order);
  

  return NextResponse.json(data, { status: 200 })
}



export default {
  getUsers
}