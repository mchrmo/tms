import { OrganizationMemberCreateSchema, OrganizationMemberUpdateSchema, ZOrganizationMemberCreateForm } from "@/lib/models/organization/member.model"
import prisma from "@/lib/prisma"
import organizationMemberService, { organizationMemberListItem } from "@/lib/services/organizations/organizationMembers.service"
import { parseGetManyParams } from "@/lib/utils/api.utils"
import { OrganizationMember, Prisma } from "@prisma/client"
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library"
import { ApiError } from "next/dist/server/api-utils"
import { NextRequest, NextResponse } from "next/server"
import { createPaginator } from "prisma-pagination"


const getOrganizationMember = async (req: NextRequest, params: any) => {

  const id = parseInt(params.id)
  const organizationMember = await organizationMemberService.get_organizationMember(id)  
  if(!organizationMember) throw new ApiError(404, 'Not found')
  
  return NextResponse.json(organizationMember, { status: 200 })
}

const createOrganizationMember = async (request: NextRequest) => {

  const body = await request.json()
  const parsedSchema = OrganizationMemberCreateSchema.safeParse(body);

  if (!parsedSchema.success) {
    const { errors } = parsedSchema.error;
    
    return NextResponse.json({
      error: { message: "Invalid request", errors },
    }, {status: 400});
  }


  const data: ZOrganizationMemberCreateForm = {
    ...parsedSchema.data
  }
  try {
    const organizationMember = await organizationMemberService.create_organizationMember(data)
    return NextResponse.json(organizationMember, { status: 200 })

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

const updateOrganizationMember = async (request: NextRequest) => {  
  const body = await request.json()
  const parsedSchema = OrganizationMemberUpdateSchema.safeParse(body);

  if (!parsedSchema.success) {
    const { errors } = parsedSchema.error;

    return NextResponse.json({
      error: { message: "Invalid request", errors },
    }, {status: 400});
  }


  const updateData = {...parsedSchema.data}

  try {
    const organizationMember = await organizationMemberService.update_organizationMember(updateData)
    return NextResponse.json(organizationMember, { status: 200 })

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

const deleteOrganizationMember = async (req: NextRequest, params: any) => {
  const id = parseInt(params.id)
  const organizationMember = await organizationMemberService.delete_organizationMember(id)  

  return NextResponse.json(organizationMember, { status: 200 })

}


const organizationMembersController = {
  getOrganizationMember,
  createOrganizationMember,
  updateOrganizationMember,
  deleteOrganizationMember
}

export default organizationMembersController