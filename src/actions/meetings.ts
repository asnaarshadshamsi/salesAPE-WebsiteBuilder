"use server";

import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { 
  createCalendarEvent, 
  refreshAccessToken,
  getUpcomingEvents,
  CalendarEvent
} from "@/lib/google-calendar";

// MeetingStatus enum values
const MeetingStatusValues = {
  SCHEDULED: 'SCHEDULED',
  CONFIRMED: 'CONFIRMED',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
  NO_SHOW: 'NO_SHOW'
} as const;

type MeetingStatus = typeof MeetingStatusValues[keyof typeof MeetingStatusValues];

export interface CreateMeetingInput {
  businessId: string;
  leadId?: string;
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  attendeeName: string;
  attendeeEmail: string;
  attendeePhone?: string;
  addGoogleMeet?: boolean;
}

export interface Meeting {
  id: string;
  businessId: string;
  leadId: string | null;
  calendarEventId: string | null;
  title: string;
  description: string | null;
  startTime: Date;
  endTime: Date;
  attendeeName: string;
  attendeeEmail: string;
  attendeePhone: string | null;
  meetLink: string | null;
  status: MeetingStatus;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Get valid access token, refreshing if needed
 */
async function getValidAccessToken(business: { id: string; calendarTokens: string | null }): Promise<string | null> {
  if (!business.calendarTokens) return null;
  
  try {
    const tokens = JSON.parse(business.calendarTokens);
    
    // Check if token is expired (with 5 min buffer)
    if (tokens.expiresAt && Date.now() > tokens.expiresAt - 5 * 60 * 1000) {
      if (!tokens.refreshToken) return null;
      
      const newTokens = await refreshAccessToken(tokens.refreshToken);
      if (!newTokens) return null;
      
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
      
      return newTokens.access_token;
    }
    
    return tokens.accessToken;
  } catch (error) {
    console.error("Error getting access token:", error);
    return null;
  }
}

/**
 * Create a meeting and optionally sync to Google Calendar
 */
export async function createMeeting(
  input: CreateMeetingInput
): Promise<{ success: boolean; meeting?: Meeting; error?: string }> {
  try {
    const user = await requireAuth();
    
    // Verify business ownership
    const business = await prisma.business.findFirst({
      where: {
        id: input.businessId,
        userId: user.id,
      },
    });
    
    if (!business) {
      return { success: false, error: "Business not found" };
    }
    
    let calendarEventId: string | null = null;
    let meetLink: string | null = null;
    
    // If calendar is connected, create calendar event
    if (business.calendarConnected) {
      const accessToken = await getValidAccessToken(business);
      
      if (accessToken) {
        const calendarEvent: CalendarEvent = {
          summary: input.title,
          description: input.description || `Meeting with ${input.attendeeName}`,
          start: {
            dateTime: input.startTime.toISOString(),
          },
          end: {
            dateTime: input.endTime.toISOString(),
          },
          attendees: [
            { email: input.attendeeEmail, displayName: input.attendeeName },
          ],
        };
        
        const createdEvent = await createCalendarEvent(
          accessToken,
          calendarEvent,
          input.addGoogleMeet
        );
        
        if (createdEvent) {
          calendarEventId = createdEvent.id || null;
          // Extract Meet link if created
          if ((createdEvent as { hangoutLink?: string }).hangoutLink) {
            meetLink = (createdEvent as { hangoutLink?: string }).hangoutLink || null;
          }
        }
      }
    }
    
    // Create meeting in database
    const meeting = await prisma.meeting.create({
      data: {
        businessId: input.businessId,
        leadId: input.leadId || null,
        calendarEventId,
        title: input.title,
        description: input.description || null,
        startTime: input.startTime,
        endTime: input.endTime,
        attendeeName: input.attendeeName,
        attendeeEmail: input.attendeeEmail,
        attendeePhone: input.attendeePhone || null,
        meetLink,
        status: 'SCHEDULED',
      },
    });
    
    // If linked to a lead, update lead status to BOOKED
    if (input.leadId) {
      await prisma.lead.update({
        where: { id: input.leadId },
        data: { status: 'BOOKED' },
      });
    }
    
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/meetings");
    
    return { 
      success: true, 
      meeting: meeting as Meeting
    };
  } catch (error) {
    console.error("Error creating meeting:", error);
    return { success: false, error: "Failed to create meeting" };
  }
}

/**
 * Get all meetings for the current user
 */
export async function getMeetingsForUser(): Promise<Meeting[]> {
  try {
    const user = await requireAuth();
    
    const meetings = await prisma.meeting.findMany({
      where: {
        business: {
          userId: user.id,
        },
      },
      orderBy: {
        startTime: 'asc',
      },
    });
    
    return meetings as Meeting[];
  } catch (error) {
    console.error("Error getting meetings:", error);
    return [];
  }
}

/**
 * Get meetings for a specific business
 */
export async function getMeetingsForBusiness(businessId: string): Promise<Meeting[]> {
  try {
    const user = await requireAuth();
    
    // Verify ownership
    const business = await prisma.business.findFirst({
      where: {
        id: businessId,
        userId: user.id,
      },
    });
    
    if (!business) {
      return [];
    }
    
    const meetings = await prisma.meeting.findMany({
      where: {
        businessId,
      },
      orderBy: {
        startTime: 'asc',
      },
    });
    
    return meetings as Meeting[];
  } catch (error) {
    console.error("Error getting meetings:", error);
    return [];
  }
}

/**
 * Update meeting status
 */
export async function updateMeetingStatus(
  meetingId: string,
  status: MeetingStatus
): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await requireAuth();
    
    // Verify ownership
    const meeting = await prisma.meeting.findFirst({
      where: {
        id: meetingId,
        business: {
          userId: user.id,
        },
      },
    });
    
    if (!meeting) {
      return { success: false, error: "Meeting not found" };
    }
    
    await prisma.meeting.update({
      where: { id: meetingId },
      data: { status },
    });
    
    // If marking as completed and linked to lead, update lead
    if (status === 'COMPLETED' && meeting.leadId) {
      await prisma.lead.update({
        where: { id: meeting.leadId },
        data: { status: 'CONVERTED' },
      });
    }
    
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/meetings");
    
    return { success: true };
  } catch (error) {
    console.error("Error updating meeting status:", error);
    return { success: false, error: "Failed to update meeting" };
  }
}

/**
 * Cancel a meeting
 */
export async function cancelMeeting(
  meetingId: string
): Promise<{ success: boolean; error?: string }> {
  return updateMeetingStatus(meetingId, 'CANCELLED');
}

/**
 * Sync upcoming meetings from Google Calendar
 */
export async function syncMeetingsFromCalendar(
  businessId: string
): Promise<{ success: boolean; synced: number; error?: string }> {
  try {
    const user = await requireAuth();
    
    const business = await prisma.business.findFirst({
      where: {
        id: businessId,
        userId: user.id,
      },
    });
    
    if (!business) {
      return { success: false, synced: 0, error: "Business not found" };
    }
    
    if (!business.calendarConnected) {
      return { success: false, synced: 0, error: "Calendar not connected" };
    }
    
    const accessToken = await getValidAccessToken(business);
    if (!accessToken) {
      return { success: false, synced: 0, error: "Invalid calendar token" };
    }
    
    const events = await getUpcomingEvents(accessToken, 50);
    let syncedCount = 0;
    
    for (const event of events) {
      // Check if meeting already exists
      const existing = await prisma.meeting.findFirst({
        where: {
          businessId,
          calendarEventId: event.id,
        },
      });
      
      if (!existing && event.start?.dateTime && event.end?.dateTime) {
        // Create new meeting from calendar event
        await prisma.meeting.create({
          data: {
            businessId,
            calendarEventId: event.id || null,
            title: event.summary || 'Untitled Meeting',
            description: event.description || null,
            startTime: new Date(event.start.dateTime),
            endTime: new Date(event.end.dateTime),
            attendeeName: event.attendees?.[0]?.displayName || event.attendees?.[0]?.email || 'Unknown',
            attendeeEmail: event.attendees?.[0]?.email || '',
            meetLink: (event as { hangoutLink?: string }).hangoutLink || null,
            status: 'SCHEDULED',
          },
        });
        syncedCount++;
      }
    }
    
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/meetings");
    
    return { success: true, synced: syncedCount };
  } catch (error) {
    console.error("Error syncing meetings:", error);
    return { success: false, synced: 0, error: "Failed to sync meetings" };
  }
}
