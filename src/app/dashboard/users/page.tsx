"use client";

import { useEffect } from 'react';
import { UserManagement } from "@/components/dashboard/user-management";
import { useAppContext } from '../layout';

export default function UsersPage() {
    const { setIsNavigating } = useAppContext();

    useEffect(() => {
        setIsNavigating(false);
    }, [setIsNavigating]);

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <UserManagement />
    </div>
  );
}