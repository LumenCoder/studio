
"use client";

import { ScheduleManagement } from "@/components/dashboard/schedule-management";

export default function SchedulePage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <ScheduleManagement />
    </div>
  );
}
