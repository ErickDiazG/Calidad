/**
 * @fileoverview Skeleton loader components for kiosk mode placeholders.
 * @module components/kiosk/SkeletonLoader
 */

import { cn } from "@/lib/utils"

interface SkeletonLoaderProps {
    /** Variant of skeleton to display */
    variant?: "card" | "table" | "image" | "text"
    /** Additional CSS classes */
    className?: string
}

/**
 * Base skeleton pulse animation component
 */
function SkeletonPulse({ className }: { className?: string }) {
    return (
        <div
            className={cn(
                "animate-pulse rounded-lg bg-muted/50",
                className
            )}
        />
    )
}

/**
 * Card-style skeleton loader
 */
function CardSkeleton() {
    return (
        <div className="rounded-xl border border-border bg-card p-6 space-y-4">
            <div className="flex items-center gap-3">
                <SkeletonPulse className="h-10 w-10 rounded-lg" />
                <div className="space-y-2 flex-1">
                    <SkeletonPulse className="h-4 w-32" />
                    <SkeletonPulse className="h-3 w-24" />
                </div>
            </div>
            <SkeletonPulse className="h-24 w-full" />
            <div className="flex gap-2">
                <SkeletonPulse className="h-8 w-20" />
                <SkeletonPulse className="h-8 w-20" />
            </div>
        </div>
    )
}

/**
 * Table-style skeleton loader
 */
function TableSkeleton() {
    return (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="p-4 border-b border-border">
                <SkeletonPulse className="h-5 w-48" />
            </div>
            <div className="p-4 space-y-3">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex items-center gap-4">
                        <SkeletonPulse className="h-4 w-8" />
                        <SkeletonPulse className="h-4 w-32 flex-1" />
                        <SkeletonPulse className="h-4 w-16" />
                        <SkeletonPulse className="h-4 w-16" />
                        <SkeletonPulse className="h-8 w-20" />
                    </div>
                ))}
            </div>
        </div>
    )
}

/**
 * Image-style skeleton loader
 */
function ImageSkeleton() {
    return (
        <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center gap-3 mb-4">
                <SkeletonPulse className="h-8 w-8 rounded-lg" />
                <SkeletonPulse className="h-4 w-36" />
            </div>
            <SkeletonPulse className="h-48 w-full rounded-lg" />
            <div className="flex gap-2 mt-4">
                <SkeletonPulse className="h-9 flex-1" />
                <SkeletonPulse className="h-9 w-24" />
            </div>
        </div>
    )
}

/**
 * Text-style skeleton loader
 */
function TextSkeleton() {
    return (
        <div className="space-y-3">
            <SkeletonPulse className="h-4 w-full" />
            <SkeletonPulse className="h-4 w-4/5" />
            <SkeletonPulse className="h-4 w-3/5" />
        </div>
    )
}

/**
 * Skeleton loader component with multiple variants.
 * Used to show placeholder content while data loads.
 */
export function SkeletonLoader({ variant = "card", className }: SkeletonLoaderProps) {
    return (
        <div className={cn("transition-opacity duration-300", className)}>
            {variant === "card" && <CardSkeleton />}
            {variant === "table" && <TableSkeleton />}
            {variant === "image" && <ImageSkeleton />}
            {variant === "text" && <TextSkeleton />}
        </div>
    )
}

/**
 * Kiosk skeleton grid for the initial loading state
 */
export function KioskSkeletonGrid() {
    return (
        <div className="grid gap-6 lg:grid-cols-2 animate-in fade-in duration-500">
            <div className="space-y-6">
                <SkeletonLoader variant="image" />
                <SkeletonLoader variant="image" />
            </div>
            <div className="space-y-6">
                <SkeletonLoader variant="card" />
                <SkeletonLoader variant="table" />
            </div>
        </div>
    )
}
