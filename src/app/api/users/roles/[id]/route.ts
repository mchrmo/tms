import { getUserRole } from "@/lib/db/user.repository";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (request: NextRequest, { params }: { params: { id: string }}) => {

  const roleId = parseInt(params.id)

  // auth().protect()
  const role = await getUserRole(roleId)  

  return NextResponse.json(role, { status: 200 })
  
};