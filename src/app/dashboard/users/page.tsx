"use client";

import { UserManagement } from "@/components/dashboard/user-management";

export default function UsersPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <UserManagement />
    </div>
  );
}
