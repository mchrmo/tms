import { auth, clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { getUserRole, isRole } from "./lib/utils";
import { NextRequest, NextResponse } from "next/server";
import { getUserByClerkId } from "./lib/db/user.repository";


const isPublicRoute = createRouteMatcher(['/sign-in(.*)', '/api(.*)']);
const isAdminRoute = createRouteMatcher(['/users(.*)'])

export default clerkMiddleware(async (auth, req) => {
 
    
  if(!isPublicRoute(req)) {
    auth().protect();
  }

  const { sessionClaims } = auth()
  
  if(isAdminRoute(req) && !isRole(sessionClaims, 'admin')) {
    return NextResponse.redirect(new URL('/', req.url))
  } 

  
}, {debug: false});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
}; 

  