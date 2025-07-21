"use client";

import { useEffect } from 'react';
import { InventoryManagement } from "@/components/dashboard/inventory-management";
import { useAppContext } from '../layout';

export default function InventoryPage() {
    const { setIsNavigating } = useAppContext();

    useEffect(() => {
        setIsNavigating(false);
    }, [setIsNavigating]);

    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <InventoryManagement />
        </div>
    );
}