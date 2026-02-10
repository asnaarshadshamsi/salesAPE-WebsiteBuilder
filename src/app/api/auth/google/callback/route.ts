import { NextRequest, NextResponse } from "next/server";
import { exchangeCodeForTokens } from "@/lib/google-calendar";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const stateParam = request.nextUrl.searchParams.get("state");
  const error = request.nextUrl.searchParams.get("error");
  
  // Handle OAuth errors
  if (error) {
    console.error("OAuth error:", error);
    return NextResponse.redirect(
      new URL(`/dashboard?error=calendar_auth_failed&message=${error}`, request.url)
    );
  }
  
  if (!code || !stateParam) {
    return NextResponse.redirect(
      new URL("/dashboard?error=missing_params", request.url)
    );
  }
  
  try {
    // Decode state
    const state = JSON.parse(Buffer.from(stateParam, "base64").toString());
    const { userId, businessId, returnUrl } = state;
    
    // Exchange code for tokens
    const tokens = await exchangeCodeForTokens(code);
    
    if (!tokens) {
      return NextResponse.redirect(
        new URL("/dashboard?error=token_exchange_failed", request.url)
      );
    }
    
    // Store tokens in the User model (or create a separate CalendarAuth model)
    // For now, we'll store in a JSON field - in production you'd encrypt this
    if (businessId) {
      await prisma.business.update({
        where: { id: businessId, userId },
        data: {
          // Store calendar tokens (this field needs to be added to schema)
          // For MVP, we'll store in a JSON-serialized format
          calendarTokens: JSON.stringify({
            accessToken: tokens.access_token,
            refreshToken: tokens.refresh_token,
            expiresAt: tokens.expires_at,
          }),
          calendarConnected: true,
        },
      });
    } else {
      // If no business specified, update user-level tokens
      // Could be stored in a separate table
      console.log("Calendar connected for user:", userId);
    }
    
    // Redirect back
    const redirectUrl = new URL(returnUrl || "/dashboard", request.url);
    redirectUrl.searchParams.set("calendar_connected", "true");
    
    return NextResponse.redirect(redirectUrl);
  } catch (err) {
    console.error("Error in Google OAuth callback:", err);
    return NextResponse.redirect(
      new URL("/dashboard?error=callback_failed", request.url)
    );
  }
}
