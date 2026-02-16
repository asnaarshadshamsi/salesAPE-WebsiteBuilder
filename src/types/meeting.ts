export type MeetingStatus = 
  | 'SCHEDULED' 
  | 'CONFIRMED' 
  | 'COMPLETED' 
  | 'CANCELLED' 
  | 'NO_SHOW';

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
