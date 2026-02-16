import { CreateMeetingInput, MeetingStatus } from '@/types';
import { meetingRepository, businessRepository } from '@/db/repositories';
import { 
  createCalendarEvent, 
  refreshAccessToken,
  getUpcomingEvents 
} from '@/lib/google-calendar';

/**
 * Meeting service - handles all meeting-related operations
 */
export class MeetingService {
  /**
   * Get meetings for a user
   */
  async getUserMeetings(userId: string, upcoming?: boolean) {
    return await meetingRepository.findByUserId(userId, upcoming);
  }

  /**
   * Get meetings for a business
   */
  async getBusinessMeetings(
    businessId: string,
    userId: string,
    filters?: { status?: MeetingStatus; upcoming?: boolean }
  ) {
    // Verify business belongs to user
    const business = await businessRepository.findByIdAndUser(businessId, userId);
    if (!business) {
      throw new Error('Business not found');
    }

    return await meetingRepository.findByBusinessId(businessId, filters);
  }

  /**
   * Create a meeting with optional Google Calendar sync
   */
  async createMeeting(userId: string, input: CreateMeetingInput) {
    // Verify business belongs to user
    const business = await businessRepository.findByIdAndUser(input.businessId, userId);
    if (!business) {
      throw new Error('Business not found');
    }

    let calendarEventId: string | undefined;
    let meetLink: string | undefined;

    // Try to create Google Calendar event if tokens are available
    if (input.addGoogleMeet && business.calendarTokens) {
      try {
        const accessToken = await this.getValidAccessToken(business);
        
        if (accessToken) {
          const calendarEvent = await createCalendarEvent(
            accessToken,
            {
              summary: input.title,
              description: input.description,
              start: {
                dateTime: input.startTime.toISOString(),
                timeZone: 'America/New_York',
              },
              end: {
                dateTime: input.endTime.toISOString(),
                timeZone: 'America/New_York',
              },
              attendees: [{ email: input.attendeeEmail }],
            },
            input.addGoogleMeet
          );

          if (calendarEvent && calendarEvent.id) {
            calendarEventId = calendarEvent.id;
            // Google Meet link would be in conferenceData
            meetLink = (calendarEvent as any).hangoutLink || (calendarEvent as any).conferenceData?.entryPoints?.[0]?.uri;
          }
        }
      } catch (error) {
        console.error('Error creating calendar event:', error);
        // Continue without calendar event
      }
    }

    // Create meeting in database
    return await meetingRepository.create({
      businessId: input.businessId,
      leadId: input.leadId,
      calendarEventId,
      title: input.title,
      description: input.description,
      startTime: input.startTime,
      endTime: input.endTime,
      attendeeName: input.attendeeName,
      attendeeEmail: input.attendeeEmail,
      attendeePhone: input.attendeePhone,
      meetLink,
    });
  }

  /**
   * Update meeting status
   */
  async updateMeetingStatus(meetingId: string, userId: string, status: MeetingStatus) {
    const meeting = await meetingRepository.findById(meetingId);
    if (!meeting) {
      throw new Error('Meeting not found');
    }

    // Verify business belongs to user
    const business = await businessRepository.findByIdAndUser(meeting.businessId, userId);
    if (!business) {
      throw new Error('Meeting not found');
    }

    return await meetingRepository.updateStatus(meetingId, status);
  }

  /**
   * Delete meeting
   */
  async deleteMeeting(meetingId: string, userId: string) {
    const meeting = await meetingRepository.findById(meetingId);
    if (!meeting) {
      throw new Error('Meeting not found');
    }

    // Verify business belongs to user
    const business = await businessRepository.findByIdAndUser(meeting.businessId, userId);
    if (!business) {
      throw new Error('Meeting not found');
    }

    await meetingRepository.delete(meetingId);
  }

  /**
   * Sync with Google Calendar
   */
  async syncWithGoogleCalendar(businessId: string, userId: string) {
    const business = await businessRepository.findByIdAndUser(businessId, userId);
    if (!business || !business.calendarTokens) {
      throw new Error('Calendar not connected');
    }

    const accessToken = await this.getValidAccessToken(business);
    if (!accessToken) {
      throw new Error('Failed to get access token');
    }

    return await getUpcomingEvents(accessToken);
  }

  /**
   * Get valid access token, refreshing if needed
   */
  private async getValidAccessToken(business: { id: string; calendarTokens: string | null }): Promise<string | null> {
    if (!business.calendarTokens) return null;
    
    try {
      const tokens = JSON.parse(business.calendarTokens);
      
      // Check if token is expired (with 5 min buffer)
      if (tokens.expiresAt && Date.now() > tokens.expiresAt - 5 * 60 * 1000) {
        if (!tokens.refreshToken) return null;
        
        const newTokens = await refreshAccessToken(tokens.refreshToken);
        if (!newTokens) return null;
        
        // Update stored tokens
        await businessRepository.updateCalendarTokens(
          business.id,
          JSON.stringify({
            accessToken: newTokens.access_token,
            refreshToken: newTokens.refresh_token || tokens.refreshToken,
            expiresAt: newTokens.expires_at,
          })
        );
        
        return newTokens.access_token;
      }
      
      return tokens.accessToken;
    } catch (error) {
      console.error('Error getting access token:', error);
      return null;
    }
  }
}

export const meetingService = new MeetingService();
