import { auth, clerkMiddleware, createRouteMatcher, currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { getUserByClerkId } from "./lib/db/user.repository";
import { UserRole } from "@prisma/client";


const isPublicRoute = createRouteMatcher(['/sign-in(.*)', '/api(.*)']);
const isAdminRoute = createRouteMatcher(['/users(.*)'])

export default clerkMiddleware(async (auth, req) => {
 
    
  if(!isPublicRoute(req)) {
    auth().protect();
  }

  const { sessionClaims } = auth()

  const isRole = (roleName: string) => {
    if(!sessionClaims || !sessionClaims.metadata || !sessionClaims.metadata.role) return false
    const role = sessionClaims.metadata.role as UserRole
    if(role.name === roleName) return true
    return false
  }

  
  if(isAdminRoute(req) && !isRole('admin')) {
    return NextResponse.redirect(new URL('/', req.url))
  } 

  
}, {debug: false});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
}; 

  