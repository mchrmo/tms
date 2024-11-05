import { organizationColumns, OrganizationCreateSchema, OrganizationUpdateSchema, ZOrganizationCreateForm } from "@/lib/models/organization/organization.model"
import prisma from "@/lib/prisma"
import organizationService, { organizationListItem } from "@/lib/services/organizations/organizations.service"
import { parseGetManyParams } from "@/lib/utils/api.utils"
import { Organization, Prisma } from "@prisma/client"
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library"
import { ApiError } from "next/dist/server/api-utils"
import { NextRequest, NextResponse } from "next/server"
import { createPaginator } from "prisma-pagination"


const getOrganization = async (req: NextRequest, params: any) => {

  const id = parseInt(params.id)
  const organization = await organizationService.get_organization(id)  
  if(!organization) throw new ApiError(404, 'Not found')
  
  return NextResponse.json(organization, { status: 200 })
}

const getOrganizations = async (req: NextRequest) => {

  const params = req.nextUrl.searchParams
  const {where, orderBy, pagination} = parseGetManyParams(params, organizationColumns)

  const paginate = createPaginator({ page: pagination.page, perPage: pagination.pageSize })
  const data = await paginate<Organization, Prisma.OrganizationFindManyArgs>(
    prisma.organization,
    {
      where,
      orderBy,
      include: organizationListItem.include,
    }
  )

  return NextResponse.json(data, { status: 200 })
}

const createOrganization = async (request: NextRequest) => {

  const body = await request.json()
  const parsedSchema = OrganizationCreateSchema.safeParse(body);

  if (!parsedSchema.success) {
    const { errors } = parsedSchema.error;
    
    return NextResponse.json({
      error: { message: "Invalid request", errors },
    }, {status: 400});
  }


  const data: ZOrganizationCreateForm = {
    ...parsedSchema.data
  }
  try {
    const organization = await organizationService.create_organization(data)
    return NextResponse.json(organization, { status: 200 })

  }
  catch (error) {
    if(error instanceof PrismaClientKnownRequestError) {
      if(error.code == 'P2002') {
        throw new ApiError(400, "Organizácia s rovnakým názvom už existuje")
      }
    }
    throw error
  }


};

const updateOrganization = async (request: NextRequest) => {  
  const body = await request.json()
  const parsedSchema = OrganizationUpdateSchema.safeParse(body);

  if (!parsedSchema.success) {
    const { errors } = parsedSchema.error;

    return NextResponse.json({
      error: { message: "Invalid request", errors },
    }, {status: 400});
  }


  const updateData = {...parsedSchema.data}

  try {
    const organization = await organizationService.update_organization(updateData)
    return NextResponse.json(organization, { status: 200 })

  }
  catch (error) {
    if(error instanceof PrismaClientKnownRequestError) {
      if(error.code == 'P2002') {
        throw new ApiError(400, "Organizácia s rovnakým názvom už existuje")
      }
    }
    throw error
  }
};

const deleteOrganization = async (req: NextRequest, params: any) => {
  const id = parseInt(params.id)
  const organization = await organizationService.delete_organization(id)  

  return NextResponse.json(organization, { status: 200 })

}


const organizationsController = {
  getOrganization,
  getOrganizations,
  createOrganization,
  updateOrganization,
  deleteOrganization
}

export default organizationsController