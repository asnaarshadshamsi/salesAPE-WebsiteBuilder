"use client";

import { useState } from "react";
import { 
  Star, 
  Flame, 
  Clock, 
  Mail, 
  Phone, 
  MessageSquare,
  ChevronDown,
  Sparkles
} from "lucide-react";

interface Lead {
  id: string;
  name: string;
  email: string;
  phone?: string;
  message?: string;
  createdAt: Date;
  status: string;
  score?: number;
}

interface LeadScoreProps {
  score: number;
  size?: "sm" | "md" | "lg";
}

export function LeadScore({ score, size = "md" }: LeadScoreProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return { bg: "bg-green-100", text: "text-green-700", label: "Hot" };
    if (score >= 60) return { bg: "bg-yellow-100", text: "text-yellow-700", label: "Warm" };
    if (score >= 40) return { bg: "bg-blue-100", text: "text-blue-700", label: "Cool" };
    return { bg: "bg-gray-100", text: "text-gray-700", label: "Cold" };
  };

  const { bg, text, label } = getScoreColor(score);

  const sizes = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-3 py-1 text-sm",
    lg: "px-4 py-1.5 text-base",
  };

  return (
    <span className={`inline-flex items-center gap-1 rounded-full font-medium ${bg} ${text} ${sizes[size]}`}>
      {score >= 80 && <Flame className="w-3 h-3" />}
      {score} · {label}
    </span>
  );
}

// Calculate lead score based on various factors
export function calculateLeadScore(lead: Lead): number {
  let score = 50; // Base score

  // Has phone number (+15)
  if (lead.phone) score += 15;

  // Has detailed message (+20)
  if (lead.message && lead.message.length > 50) score += 20;
  else if (lead.message && lead.message.length > 20) score += 10;

  // Recency bonus (newer = hotter)
  const hoursAgo = (Date.now() - new Date(lead.createdAt).getTime()) / (1000 * 60 * 60);
  if (hoursAgo < 1) score += 20; // Less than 1 hour
  else if (hoursAgo < 24) score += 10; // Less than 1 day
  else if (hoursAgo > 168) score -= 10; // More than 1 week old

  // Email quality (business email vs personal)
  const personalDomains = ["gmail", "yahoo", "hotmail", "outlook", "aol"];
  const emailDomain = lead.email.split("@")[1]?.split(".")[0] || "";
  if (!personalDomains.includes(emailDomain.toLowerCase())) {
    score += 15; // Business email
  }

  // Clamp score between 0-100
  return Math.max(0, Math.min(100, score));
}

// Priority badge component
interface PriorityBadgeProps {
  priority: "urgent" | "high" | "medium" | "low";
}

export function PriorityBadge({ priority }: PriorityBadgeProps) {
  const config = {
    urgent: { bg: "bg-red-100", text: "text-red-700", icon: Flame },
    high: { bg: "bg-orange-100", text: "text-orange-700", icon: Star },
    medium: { bg: "bg-blue-100", text: "text-blue-700", icon: Clock },
    low: { bg: "bg-gray-100", text: "text-gray-700", icon: Clock },
  };

  const { bg, text, icon: Icon } = config[priority];

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${bg} ${text}`}>
      <Icon className="w-3 h-3" />
      {priority.charAt(0).toUpperCase() + priority.slice(1)}
    </span>
  );
}

// Quick actions for leads
interface LeadQuickActionsProps {
  lead: Lead;
  onAction: (action: string, leadId: string) => void;
}

export function LeadQuickActions({ lead, onAction }: LeadQuickActionsProps) {
  const [isOpen, setIsOpen] = useState(false);

  const actions = [
    { id: "email", label: "Send Email", icon: Mail },
    { id: "call", label: "Call", icon: Phone },
    { id: "note", label: "Add Note", icon: MessageSquare },
    { id: "priority", label: "Set Priority", icon: Star },
  ];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <ChevronDown className="w-4 h-4" />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-50">
            {actions.map((action) => (
              <button
                key={action.id}
                onClick={() => {
                  onAction(action.id, lead.id);
                  setIsOpen(false);
                }}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <action.icon className="w-4 h-4" />
                {action.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// AI-suggested follow-up
interface AIFollowUpProps {
  leadName: string;
  businessType: string;
}

export function AIFollowUpSuggestion({ leadName, businessType }: AIFollowUpProps) {
  const suggestions = [
    `Hi ${leadName}! Thanks for reaching out about our ${businessType} services. I'd love to schedule a quick call to discuss your needs. What time works best for you?`,
    `Hello ${leadName}! I noticed you were interested in learning more. I've put together some information that might help. Would you like me to send it over?`,
    `Hey ${leadName}! Just following up on your inquiry. We have some exciting offers this week that might interest you. Let me know if you'd like to learn more!`,
  ];

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(suggestions[selectedIndex]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-linear-to-r from-indigo-50 to-purple-50 rounded-xl p-4 border border-indigo-100">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-4 h-4 text-indigo-600" />
        <span className="text-sm font-medium text-indigo-900">AI-Suggested Follow-up</span>
      </div>

      <p className="text-sm text-gray-700 mb-3">{suggestions[selectedIndex]}</p>

      <div className="flex items-center justify-between">
        <div className="flex gap-1">
          {suggestions.map((_, i) => (
            <button
              key={i}
              onClick={() => setSelectedIndex(i)}
              className={`w-2 h-2 rounded-full transition-colors ${
                i === selectedIndex ? "bg-indigo-600" : "bg-indigo-200"
              }`}
            />
          ))}
        </div>
        <button
          onClick={handleCopy}
          className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
        >
          {copied ? "Copied!" : "Copy Message"}
        </button>
      </div>
    </div>
  );
}
