"use client";

import { useState } from "react";
import { updateLeadStatus, deleteLead } from "@/actions/leads";
import { MoreVertical, Check, Phone, Calendar, XCircle, Trash2 } from "lucide-react";

type LeadStatus = "NEW" | "CONTACTED" | "BOOKED" | "CONVERTED" | "LOST";

interface LeadActionsProps {
  leadId: string;
  currentStatus: LeadStatus;
}

export function LeadActions({ leadId, currentStatus }: LeadActionsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleStatusChange = async (status: LeadStatus) => {
    setIsLoading(true);
    await updateLeadStatus(leadId, status);
    setIsLoading(false);
    setIsOpen(false);
  };

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this lead?")) {
      setIsLoading(true);
      await deleteLead(leadId);
      setIsLoading(false);
      setIsOpen(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isLoading}
        className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
      >
        <MoreVertical className="w-5 h-5" />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 z-20 overflow-hidden">
            <div className="py-1">
              <p className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase">
                Update Status
              </p>
              {currentStatus !== "CONTACTED" && (
                <button
                  onClick={() => handleStatusChange("CONTACTED")}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                >
                  <Phone className="w-4 h-4 mr-2 text-yellow-500" />
                  Mark as Contacted
                </button>
              )}
              {currentStatus !== "BOOKED" && (
                <button
                  onClick={() => handleStatusChange("BOOKED")}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                >
                  <Calendar className="w-4 h-4 mr-2 text-purple-500" />
                  Mark as Booked
                </button>
              )}
              {currentStatus !== "CONVERTED" && (
                <button
                  onClick={() => handleStatusChange("CONVERTED")}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                >
                  <Check className="w-4 h-4 mr-2 text-green-500" />
                  Mark as Converted
                </button>
              )}
              {currentStatus !== "LOST" && (
                <button
                  onClick={() => handleStatusChange("LOST")}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                >
                  <XCircle className="w-4 h-4 mr-2 text-gray-500" />
                  Mark as Lost
                </button>
              )}
              <hr className="my-1" />
              <button
                onClick={handleDelete}
                className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Lead
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
