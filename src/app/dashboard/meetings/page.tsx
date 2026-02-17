import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { getUserMeetings, Meeting } from "@/actions/meetings";
import { signOut } from "@/actions/auth";
import { formatRelativeTime } from "@/lib/utils";
import {
  Rocket,
  ArrowLeft,
  LogOut,
  Calendar,
  Video,
  Clock,
  User,
  Mail,
  Phone,
  ExternalLink,
} from "lucide-react";

function MeetingStatusBadge({ status }: { status: Meeting['status'] }) {
  const styles: Record<Meeting['status'], string> = {
    SCHEDULED: 'bg-blue-500/20 text-blue-400',
    CONFIRMED: 'bg-emerald-500/20 text-emerald-400',
    COMPLETED: 'bg-zinc-700 text-gray-300',
    CANCELLED: 'bg-red-500/20 text-red-400',
    NO_SHOW: 'bg-amber-500/20 text-amber-400',
  };

  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[status]}`}>
      {status}
    </span>
  );
}

function formatDateTime(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(new Date(date));
}

function formatDuration(start: Date, end: Date): string {
  const ms = new Date(end).getTime() - new Date(start).getTime();
  const minutes = Math.round(ms / 60000);
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const remainingMins = minutes % 60;
  return remainingMins > 0 ? `${hours}h ${remainingMins}m` : `${hours}h`;
}

export default async function MeetingsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const meetings = await getUserMeetings();
  
  // Separate upcoming and past meetings
  const now = new Date();
  const upcomingMeetings = meetings.filter(m => new Date(m.startTime) > now && m.status !== 'CANCELLED');
  const pastMeetings = meetings.filter(m => new Date(m.startTime) <= now || m.status === 'CANCELLED');

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="bg-zinc-950 border-b border-pink-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-linear-to-br from-pink-500 to-pink-600 rounded-lg flex items-center justify-center shadow-lg shadow-pink-500/25">
                <Rocket className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-linear-to-r from-pink-400 to-pink-600 bg-clip-text text-transparent">
                HackSquad
              </span>
            </Link>

            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-400">
                {user.name || user.email}
              </span>
              <form action={signOut}>
                <button
                  type="submit"
                  className="text-gray-400 hover:text-pink-400 p-2 rounded-lg hover:bg-zinc-800 transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          href="/dashboard"
          className="inline-flex items-center text-gray-400 hover:text-pink-400 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Link>

        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">Meetings</h1>
            <p className="text-gray-400">
              Manage your scheduled meetings and appointments
            </p>
          </div>
        </div>

        {/* Upcoming Meetings */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-pink-400" />
            Upcoming Meetings ({upcomingMeetings.length})
          </h2>
          
          {upcomingMeetings.length === 0 ? (
            <div className="bg-zinc-900 rounded-xl shadow-lg border border-pink-500/20 p-8 text-center">
              <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-gray-500" />
              </div>
              <h3 className="text-lg font-medium text-white mb-2">
                No upcoming meetings
              </h3>
              <p className="text-gray-400">
                Meetings booked through your website will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {upcomingMeetings.map((meeting) => (
                <div
                  key={meeting.id}
                  className="bg-zinc-900 rounded-xl shadow-lg border border-pink-500/20 p-6"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-white">
                        {meeting.title}
                      </h3>
                      <div className="flex items-center gap-4 mt-1 text-sm text-gray-400">
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {formatDateTime(meeting.startTime)}
                        </span>
                        <span>
                          ({formatDuration(meeting.startTime, meeting.endTime)})
                        </span>
                      </div>
                    </div>
                    <MeetingStatusBadge status={meeting.status} />
                  </div>

                  <div className="flex items-center gap-6 text-sm">
                    <div className="flex items-center gap-2 text-gray-400">
                      <User className="w-4 h-4" />
                      {meeting.attendeeName}
                    </div>
                    <div className="flex items-center gap-2 text-gray-400">
                      <Mail className="w-4 h-4" />
                      {meeting.attendeeEmail}
                    </div>
                    {meeting.attendeePhone && (
                      <div className="flex items-center gap-2 text-gray-400">
                        <Phone className="w-4 h-4" />
                        {meeting.attendeePhone}
                      </div>
                    )}
                  </div>

                  {meeting.meetLink && (
                    <a
                      href={meeting.meetLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors shadow-lg shadow-pink-500/25"
                    >
                      <Video className="w-4 h-4" />
                      Join Meeting
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Past Meetings */}
        {pastMeetings.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-gray-500" />
              Past Meetings ({pastMeetings.length})
            </h2>
            
            <div className="bg-zinc-900 rounded-xl shadow-lg border border-pink-500/20 overflow-hidden">
              <table className="w-full">
                <thead className="bg-zinc-800/50 border-b border-pink-500/10">
                  <tr>
                    <th className="text-left px-6 py-3 text-sm font-semibold text-gray-300">
                      Meeting
                    </th>
                    <th className="text-left px-6 py-3 text-sm font-semibold text-gray-300">
                      Attendee
                    </th>
                    <th className="text-left px-6 py-3 text-sm font-semibold text-gray-300">
                      Date
                    </th>
                    <th className="text-left px-6 py-3 text-sm font-semibold text-gray-300">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {pastMeetings.map((meeting) => (
                    <tr key={meeting.id} className="hover:bg-zinc-800/50 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-medium text-white">{meeting.title}</p>
                        <p className="text-sm text-gray-500">
                          {formatDuration(meeting.startTime, meeting.endTime)}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-gray-300">{meeting.attendeeName}</p>
                        <p className="text-sm text-gray-500">{meeting.attendeeEmail}</p>
                      </td>
                      <td className="px-6 py-4 text-gray-400">
                        {formatDateTime(meeting.startTime)}
                      </td>
                      <td className="px-6 py-4">
                        <MeetingStatusBadge status={meeting.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
