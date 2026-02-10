import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getGoogleOAuthUrl } from "@/lib/google-calendar";
import { verifyToken } from "@/lib/auth";

export async function GET(request: NextRequest) {
  // Verify user is logged in
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  
  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  
  const user = await verifyToken(token);
  if (!user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  
  // Get the business ID from query params
  const businessId = request.nextUrl.searchParams.get("businessId");
  
  // Create state to pass business context through OAuth
  const state = JSON.stringify({
    userId: user.id,
    businessId,
    returnUrl: request.nextUrl.searchParams.get("returnUrl") || "/dashboard",
  });
  
  // Encode state as base64
  const encodedState = Buffer.from(state).toString("base64");
  
  // Redirect to Google OAuth
  const authUrl = getGoogleOAuthUrl(encodedState);
  
  return NextResponse.redirect(authUrl);
}
