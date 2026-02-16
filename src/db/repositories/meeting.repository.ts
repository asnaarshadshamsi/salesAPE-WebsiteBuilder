import { Meeting, MeetingStatus } from '@/types';
import { prisma } from '../client';

export class MeetingRepository {
  /**
   * Find meeting by ID
   */
  async findById(meetingId: string): Promise<Meeting | null> {
    return await prisma.meeting.findUnique({
      where: { id: meetingId },
    });
  }

  /**
   * Find meetings by business ID
   */
  async findByBusinessId(
    businessId: string,
    filters?: {
      status?: MeetingStatus;
      upcoming?: boolean;
    }
  ): Promise<Meeting[]> {
    const where: any = { businessId };

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.upcoming) {
      where.startTime = { gte: new Date() };
    }

    return await prisma.meeting.findMany({
      where,
      orderBy: { startTime: 'asc' },
    });
  }

  /**
   * Find meetings for user's businesses
   */
  async findByUserId(userId: string, upcoming?: boolean) {
    const where: any = {
      business: {
        userId,
      },
    };

    if (upcoming) {
      where.startTime = { gte: new Date() };
    }

    return await prisma.meeting.findMany({
      where,
      include: {
        business: {
          select: { name: true },
        },
      },
      orderBy: { startTime: 'asc' },
    });
  }

  /**
   * Create a new meeting
   */
  async create(data: {
    businessId: string;
    leadId?: string;
    calendarEventId?: string;
    title: string;
    description?: string;
    startTime: Date;
    endTime: Date;
    attendeeName: string;
    attendeeEmail: string;
    attendeePhone?: string;
    meetLink?: string;
  }): Promise<Meeting> {
    return await prisma.meeting.create({
      data: {
        ...data,
        status: 'SCHEDULED',
      },
    });
  }

  /**
   * Update meeting
   */
  async update(meetingId: string, data: Partial<Meeting>): Promise<Meeting> {
    return await prisma.meeting.update({
      where: { id: meetingId },
      data,
    });
  }

  /**
   * Update meeting status
   */
  async updateStatus(meetingId: string, status: MeetingStatus): Promise<Meeting> {
    return await prisma.meeting.update({
      where: { id: meetingId },
      data: { status },
    });
  }

  /**
   * Delete meeting
   */
  async delete(meetingId: string): Promise<void> {
    await prisma.meeting.delete({
      where: { id: meetingId },
    });
  }

  /**
   * Find meeting by calendar event ID
   */
  async findByCalendarEventId(eventId: string): Promise<Meeting | null> {
    return await prisma.meeting.findFirst({
      where: { calendarEventId: eventId },
    });
  }
}

export const meetingRepository = new MeetingRepository();
