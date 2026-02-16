"use server";

import { requireAuth } from "@/lib/auth";
import { meetingService } from "@/services/meeting";
import { revalidatePath } from "next/cache";
import { CreateMeetingInput, MeetingStatus, Meeting } from "@/types";

export type { Meeting } from "@/types";

// ==================== CREATE MEETING ====================

export async function createMeeting(
  input: CreateMeetingInput
): Promise<{ success: boolean; meeting?: Meeting; error?: string }> {
  try {
    const user = await requireAuth();
    const meeting = await meetingService.createMeeting(user.id, input);
    
    revalidatePath("/dashboard/meetings");
    
    return { success: true, meeting };
  } catch (error) {
    console.error("Error creating meeting:", error);
    if (error instanceof Error && error.message === "Unauthorized") {
      return { success: false, error: "Please sign in to continue" };
    }
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to create meeting" 
    };
  }
}

// ==================== GET USER MEETINGS ====================

export async function getUserMeetings(upcoming?: boolean) {
  try {
    const user = await requireAuth();
    return await meetingService.getUserMeetings(user.id, upcoming);
  } catch {
    return [];
  }
}

// ==================== GET BUSINESS MEETINGS ====================

export async function getBusinessMeetings(
  businessId: string,
  filters?: { status?: MeetingStatus; upcoming?: boolean }
) {
  try {
    const user = await requireAuth();
    return await meetingService.getBusinessMeetings(businessId, user.id, filters);
  } catch {
    return [];
  }
}

// ==================== UPDATE MEETING STATUS ====================

export async function updateMeetingStatus(
  meetingId: string,
  status: MeetingStatus
): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await requireAuth();
    await meetingService.updateMeetingStatus(meetingId, user.id, status);
    
    revalidatePath("/dashboard/meetings");
    
    return { success: true };
  } catch (error) {
    console.error("Error updating meeting status:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to update meeting" 
    };
  }
}

// ==================== DELETE MEETING ====================

export async function deleteMeeting(
  meetingId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await requireAuth();
    await meetingService.deleteMeeting(meetingId, user.id);
    
    revalidatePath("/dashboard/meetings");
    
    return { success: true };
  } catch (error) {
    console.error("Error deleting meeting:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to delete meeting" 
    };
  }
}

// ==================== SYNC GOOGLE CALENDAR ====================

export async function syncGoogleCalendar(businessId: string) {
  try {
    const user = await requireAuth();
    return await meetingService.syncWithGoogleCalendar(businessId, user.id);
  } catch (error) {
    console.error("Error syncing calendar:", error);
    return null;
  }
}
