import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { 
  createCalendarEvent, 
  refreshAccessToken,
  getAvailableSlots,
  CalendarEvent
} from "@/lib/google-calendar";

/**
 * GET /api/booking/[slug]/slots
 * Get available booking slots for a business
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    
    // Get query params
    const searchParams = request.nextUrl.searchParams;
    const startDate = searchParams.get("start");
    const endDate = searchParams.get("end");
    
    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: "Start and end dates are required" },
        { status: 400 }
      );
    }
    
    // Find the site and business
    const site = await prisma.site.findUnique({
      where: { slug },
      include: {
        business: true,
      },
    });
    
    if (!site) {
      return NextResponse.json(
        { error: "Business not found" },
        { status: 404 }
      );
    }
    
    const business = site.business;
    
    // If calendar is not connected, return empty slots with calendly URL if available
    if (!business.calendarConnected || !business.calendarTokens) {
      return NextResponse.json({
        slots: [],
        calendlyUrl: business.calendlyUrl,
        calendarConnected: false,
      });
    }
    
    // Get access token
    let accessToken: string | null = null;
    try {
      const tokens = JSON.parse(business.calendarTokens);
      
      // Check if token is expired
      if (tokens.expiresAt && Date.now() > tokens.expiresAt - 5 * 60 * 1000) {
        if (tokens.refreshToken) {
          const newTokens = await refreshAccessToken(tokens.refreshToken);
          if (newTokens) {
            accessToken = newTokens.access_token;
            // Update stored tokens
            await prisma.business.update({
              where: { id: business.id },
              data: {
                calendarTokens: JSON.stringify({
                  accessToken: newTokens.access_token,
                  refreshToken: newTokens.refresh_token || tokens.refreshToken,
                  expiresAt: newTokens.expires_at,
                }),
              },
            });
          }
        }
      } else {
        accessToken = tokens.accessToken;
      }
    } catch (e) {
      console.error("Error parsing calendar tokens:", e);
    }
    
    if (!accessToken) {
      return NextResponse.json({
        slots: [],
        calendlyUrl: business.calendlyUrl,
        calendarConnected: false,
        error: "Calendar authentication expired",
      });
    }
    
    // Get available slots
    const slots = await getAvailableSlots(
      accessToken,
      new Date(startDate),
      new Date(endDate),
      business.meetingDuration || 30
    );
    
    return NextResponse.json({
      slots,
      duration: business.meetingDuration || 30,
      calendarConnected: true,
    });
  } catch (error) {
    console.error("Error getting booking slots:", error);
    return NextResponse.json(
      { error: "Failed to get available slots" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/booking/[slug]/slots
 * Book a meeting slot
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const body = await request.json();
    
    const { startTime, endTime, name, email, phone, message } = body;
    
    if (!startTime || !endTime || !name || !email) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }
    
    // Find the site and business
    const site = await prisma.site.findUnique({
      where: { slug },
      include: {
        business: true,
      },
    });
    
    if (!site) {
      return NextResponse.json(
        { error: "Business not found" },
        { status: 404 }
      );
    }
    
    const business = site.business;
    
    let calendarEventId: string | null = null;
    let meetLink: string | null = null;
    
    // If calendar is connected, create the event
    if (business.calendarConnected && business.calendarTokens) {
      try {
        const tokens = JSON.parse(business.calendarTokens);
        let accessToken = tokens.accessToken;
        
        // Refresh if needed
        if (tokens.expiresAt && Date.now() > tokens.expiresAt - 5 * 60 * 1000) {
          if (tokens.refreshToken) {
            const newTokens = await refreshAccessToken(tokens.refreshToken);
            if (newTokens) {
              accessToken = newTokens.access_token;
            }
          }
        }
        
        if (accessToken) {
          const calendarEvent: CalendarEvent = {
            summary: `Meeting with ${name}`,
            description: message || `Booked via ${business.name} website`,
            start: {
              dateTime: new Date(startTime).toISOString(),
            },
            end: {
              dateTime: new Date(endTime).toISOString(),
            },
            attendees: [
              { email, displayName: name },
            ],
          };
          
          const createdEvent = await createCalendarEvent(accessToken, calendarEvent, true);
          
          if (createdEvent) {
            calendarEventId = createdEvent.id || null;
            if ((createdEvent as { hangoutLink?: string }).hangoutLink) {
              meetLink = (createdEvent as { hangoutLink?: string }).hangoutLink || null;
            }
          }
        }
      } catch (e) {
        console.error("Error creating calendar event:", e);
        // Continue without calendar event
      }
    }
    
    // Create meeting in database
    const meeting = await prisma.meeting.create({
      data: {
        businessId: business.id,
        calendarEventId,
        title: `Meeting with ${name}`,
        description: message || null,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        attendeeName: name,
        attendeeEmail: email,
        attendeePhone: phone || null,
        meetLink,
        status: 'SCHEDULED',
      },
    });
    
    // Also create a lead
    await prisma.lead.create({
      data: {
        siteId: site.id,
        name,
        email,
        phone: phone || null,
        message: message || `Booked a meeting for ${new Date(startTime).toLocaleString()}`,
        status: 'BOOKED',
        source: 'booking',
      },
    });
    
    return NextResponse.json({
      success: true,
      meeting: {
        id: meeting.id,
        startTime: meeting.startTime,
        endTime: meeting.endTime,
        meetLink: meeting.meetLink,
      },
    });
  } catch (error) {
    console.error("Error booking meeting:", error);
    return NextResponse.json(
      { error: "Failed to book meeting" },
      { status: 500 }
    );
  }
}
