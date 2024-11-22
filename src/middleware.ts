import { clerkClient, clerkMiddleware, ClerkMiddlewareAuth, createRouteMatcher, currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher(['/sign-in(.*)']);

const isApiRoute = createRouteMatcher(['/api(.*)']);

const isAdminRoute = createRouteMatcher(['/users(.*)'])


async function middleware(req: NextRequest, auth: ClerkMiddlewareAuth) {
  const userId = auth().userId
  const requestHeaders = new Headers(req.headers)

  if(!userId) {
    return NextResponse.json({'message': "Unauthorized - test"}, {status: 403})
  }

  const user = await clerkClient.users.getUser(userId)
  if(!user) {
    return NextResponse.json({'message': "User not found"}, {status: 403})
  }

  if(user) {
    requestHeaders.set('x-clerkUserId', userId); // Or store entire user object as JSON
  }

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    }
  })

}

export default clerkMiddleware(async (auth, req, evt) => {
 
    
  const { userId, redirectToSignIn } = await auth()
  
  if(isPublicRoute(req)) {
    return NextResponse.next()
  }

  if (!userId && !isPublicRoute(req) && !isApiRoute(req))  {
    return redirectToSignIn()
  }

  return middleware(req, auth)
}, {debug: false});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
}; 

  