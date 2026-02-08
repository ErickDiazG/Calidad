/**
 * @fileoverview Custom hook for inspection business logic.
 * Separates inspection state management from UI components.
 * @module hooks/useInspection
 */

import { useState, useCallback } from "react"
import type { InspectionSpec } from "@/lib/data"
import { INITIAL_SPECS } from "@/lib/data"

/**
 * Inspection state and methods returned by the hook
 * @interface UseInspectionReturn
 */
interface UseInspectionReturn {
    /** List of inspection specifications with current values */
    specs: InspectionSpec[]
    /** Update an inspection value and recalculate status */
    updateSpec: (id: number, actual: number | null) => void
    /** Reset all specs to initial pending state */
    resetSpecs: () => void
    /** Whether lot has been released */
    lotReleased: boolean
    /** Set lot release status */
    setLotReleased: (released: boolean) => void
    /** Whether lot has been rejected */
    lotRejected: boolean
    /** Set lot rejection status */
    setLotRejected: (rejected: boolean) => void
    /** Number of specs that passed */
    passCount: number
    /** Number of specs that failed */
    failCount: number
    /** Number of specs still pending */
    pendingCount: number
    /** Whether all specs have passed */
    allPassed: boolean
    /** Whether any specs have failed */
    hasFailed: boolean
}

/**
 * Determines the status of an inspection spec based on actual value
 * @param {number | null} actual - The actual measured value
 * @param {number} min - Minimum acceptable value
 * @param {number} max - Maximum acceptable value
 * @returns {"pending" | "pass" | "fail"} The calculated status
 */
function calculateStatus(
    actual: number | null,
    min: number,
    max: number
): "pending" | "pass" | "fail" {
    if (actual === null) return "pending"
    return actual >= min && actual <= max ? "pass" : "fail"
}

/**
 * Custom hook for managing inspection state and business logic.
 * Provides state management, validation, and derived values for the inspection workflow.
 * 
 * @param {InspectionSpec[]} [initialSpecs=INITIAL_SPECS] - Initial specification data
 * @returns {UseInspectionReturn} Inspection state and methods
 * @example
 * const { specs, updateSpec, allPassed } = useInspection()
 * 
 * // Update a spec when user enters a value
 * updateSpec(1, 0.50)
 * 
 * // Check if ready to release
 * if (allPassed) {
 *   handleRelease()
 * }
 */
export function useInspection(initialSpecs: InspectionSpec[] = INITIAL_SPECS): UseInspectionReturn {
    const [specs, setSpecs] = useState<InspectionSpec[]>(initialSpecs)
    const [lotReleased, setLotReleased] = useState(false)
    const [lotRejected, setLotRejected] = useState(false)

    /**
     * Update a specification's actual value and recalculate its status
     * @param {number} id - The specification ID to update
     * @param {number | null} actual - The new actual value (null to clear)
     */
    const updateSpec = useCallback((id: number, actual: number | null) => {
        setSpecs((prevSpecs) =>
            prevSpecs.map((spec) => {
                if (spec.id !== id) return spec
                const status = calculateStatus(actual, spec.min, spec.max)
                return { ...spec, actual, status }
            })
        )
    }, [])

    /**
     * Reset all specifications to their initial pending state
     */
    const resetSpecs = useCallback(() => {
        setSpecs(
            initialSpecs.map((spec) => ({
                ...spec,
                actual: null,
                status: "pending" as const,
            }))
        )
        setLotReleased(false)
        setLotRejected(false)
    }, [initialSpecs])

    // Derived state calculations
    const passCount = specs.filter((s) => s.status === "pass").length
    const failCount = specs.filter((s) => s.status === "fail").length
    const pendingCount = specs.filter((s) => s.status === "pending").length
    const allPassed = passCount === specs.length && specs.length > 0
    const hasFailed = failCount > 0

    return {
        specs,
        updateSpec,
        resetSpecs,
        lotReleased,
        setLotReleased,
        lotRejected,
        setLotRejected,
        passCount,
        failCount,
        pendingCount,
        allPassed,
        hasFailed,
    }
}
