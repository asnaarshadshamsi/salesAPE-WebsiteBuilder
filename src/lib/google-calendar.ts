/**
 * Google Calendar Integration
 * Handles OAuth flow and calendar operations for meeting scheduling
 */

export interface GoogleTokens {
  access_token: string;
  refresh_token?: string;
  expires_at?: number;
  token_type: string;
  scope: string;
}

export interface CalendarEvent {
  id?: string;
  summary: string;
  description?: string;
  start: {
    dateTime: string;
    timeZone?: string;
  };
  end: {
    dateTime: string;
    timeZone?: string;
  };
  attendees?: { email: string; displayName?: string }[];
  conferenceData?: {
    createRequest?: {
      requestId: string;
      conferenceSolutionKey: { type: string };
    };
  };
}

export interface CalendarSlot {
  start: string;
  end: string;
  available: boolean;
}

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || '';
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/api/auth/google/callback';

const SCOPES = [
  'https://www.googleapis.com/auth/calendar',
  'https://www.googleapis.com/auth/calendar.events',
  'https://www.googleapis.com/auth/calendar.readonly',
].join(' ');

/**
 * Generate OAuth URL for Google Calendar authorization
 */
export function getGoogleOAuthUrl(state?: string): string {
  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: GOOGLE_REDIRECT_URI,
    response_type: 'code',
    scope: SCOPES,
    access_type: 'offline',
    prompt: 'consent',
    ...(state && { state }),
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

/**
 * Exchange authorization code for tokens
 */
export async function exchangeCodeForTokens(code: string): Promise<GoogleTokens | null> {
  try {
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        code,
        grant_type: 'authorization_code',
        redirect_uri: GOOGLE_REDIRECT_URI,
      }),
    });

    if (!response.ok) {
      console.error('Failed to exchange code:', await response.text());
      return null;
    }

    const tokens = await response.json();
    return {
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expires_at: Date.now() + tokens.expires_in * 1000,
      token_type: tokens.token_type,
      scope: tokens.scope,
    };
  } catch (error) {
    console.error('Error exchanging code for tokens:', error);
    return null;
  }
}

/**
 * Refresh expired access token
 */
export async function refreshAccessToken(refreshToken: string): Promise<GoogleTokens | null> {
  try {
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      }),
    });

    if (!response.ok) {
      console.error('Failed to refresh token:', await response.text());
      return null;
    }

    const tokens = await response.json();
    return {
      access_token: tokens.access_token,
      refresh_token: refreshToken, // Keep the original refresh token
      expires_at: Date.now() + tokens.expires_in * 1000,
      token_type: tokens.token_type,
      scope: tokens.scope,
    };
  } catch (error) {
    console.error('Error refreshing token:', error);
    return null;
  }
}

/**
 * Get available calendar slots for scheduling
 */
export async function getAvailableSlots(
  accessToken: string,
  startDate: Date,
  endDate: Date,
  duration: number = 30 // minutes
): Promise<CalendarSlot[]> {
  try {
    // Get busy times from calendar
    const response = await fetch(
      'https://www.googleapis.com/calendar/v3/freeBusy',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          timeMin: startDate.toISOString(),
          timeMax: endDate.toISOString(),
          items: [{ id: 'primary' }],
        }),
      }
    );

    if (!response.ok) {
      console.error('Failed to get free/busy:', await response.text());
      return [];
    }

    const data = await response.json();
    const busyTimes = data.calendars?.primary?.busy || [];

    // Generate available slots (business hours: 9am-5pm)
    const slots: CalendarSlot[] = [];
    const current = new Date(startDate);
    
    while (current < endDate) {
      const hour = current.getHours();
      
      // Only business hours (9am - 5pm)
      if (hour >= 9 && hour < 17) {
        const slotStart = new Date(current);
        const slotEnd = new Date(current.getTime() + duration * 60 * 1000);
        
        // Check if slot overlaps with any busy time
        const isBusy = busyTimes.some((busy: { start: string; end: string }) => {
          const busyStart = new Date(busy.start);
          const busyEnd = new Date(busy.end);
          return slotStart < busyEnd && slotEnd > busyStart;
        });

        slots.push({
          start: slotStart.toISOString(),
          end: slotEnd.toISOString(),
          available: !isBusy,
        });
      }
      
      // Move to next slot
      current.setMinutes(current.getMinutes() + duration);
    }

    return slots.filter(slot => slot.available);
  } catch (error) {
    console.error('Error getting available slots:', error);
    return [];
  }
}

/**
 * Create a calendar event (meeting)
 */
export async function createCalendarEvent(
  accessToken: string,
  event: CalendarEvent,
  addMeet: boolean = false
): Promise<CalendarEvent | null> {
  try {
    const eventData: CalendarEvent = {
      ...event,
    };

    // Add Google Meet if requested
    if (addMeet) {
      eventData.conferenceData = {
        createRequest: {
          requestId: `meet-${Date.now()}`,
          conferenceSolutionKey: { type: 'hangoutsMeet' },
        },
      };
    }

    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events${addMeet ? '?conferenceDataVersion=1' : ''}`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData),
      }
    );

    if (!response.ok) {
      console.error('Failed to create event:', await response.text());
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating calendar event:', error);
    return null;
  }
}

/**
 * Get upcoming events from calendar
 */
export async function getUpcomingEvents(
  accessToken: string,
  maxResults: number = 10
): Promise<CalendarEvent[]> {
  try {
    const params = new URLSearchParams({
      maxResults: maxResults.toString(),
      timeMin: new Date().toISOString(),
      orderBy: 'startTime',
      singleEvents: 'true',
    });

    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events?${params}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      console.error('Failed to get events:', await response.text());
      return [];
    }

    const data = await response.json();
    return data.items || [];
  } catch (error) {
    console.error('Error getting upcoming events:', error);
    return [];
  }
}

/**
 * Delete a calendar event
 */
export async function deleteCalendarEvent(
  accessToken: string,
  eventId: string
): Promise<boolean> {
  try {
    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    return response.ok;
  } catch (error) {
    console.error('Error deleting calendar event:', error);
    return false;
  }
}

/**
 * Check if tokens are configured
 */
export function isGoogleCalendarConfigured(): boolean {
  return Boolean(GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET);
}
