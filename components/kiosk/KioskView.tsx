/**
 * @fileoverview Kiosk view container component.
 * Displays smart search bar and skeleton loaders when no lot is scanned.
 * @module components/kiosk/KioskView
 */

"use client"

import { SmartSearchBar } from "./SmartSearchBar"
import { KioskSkeletonGrid } from "./SkeletonLoader"
import { useSession } from "@/context/SessionContext"

/**
 * Kiosk view component for the initial scan state.
 * Shows centered search bar and skeleton placeholders.
 */
export function KioskView() {
    const { scanLot, isLoading } = useSession()

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Smart Search Bar */}
            <div className="py-8">
                <SmartSearchBar onScan={scanLot} isLoading={isLoading} />
            </div>

            {/* Skeleton Grid */}
            <div className="opacity-50">
                <KioskSkeletonGrid />
            </div>
        </div>
    )
}
