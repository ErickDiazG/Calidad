/**
 * @fileoverview Session context for managing kiosk workflow state.
 * Handles scanned lot, current user, and authentication state.
 * @module context/SessionContext
 */

"use client"

import React, { createContext, useContext, useState, useCallback, type ReactNode } from "react"
import type { Role, LotInfo, UserCredential } from "@/lib/data"
import { MOCK_CREDENTIALS, SCANNED_LOT, VALID_LOT_PREFIXES } from "@/lib/data"

/**
 * Current authenticated user info
 */
interface CurrentUser {
    name: string
    role: Role
}

/**
 * Session context state and methods
 */
interface SessionContextType {
    /** Currently scanned lot (null = kiosk mode) */
    scannedLot: LotInfo | null
    /** Current authenticated user */
    currentUser: CurrentUser | null
    /** Current role */
    currentRole: Role
    /** Whether data is loading */
    isLoading: boolean
    /** Whether in kiosk mode (no lot scanned) */
    isKioskMode: boolean
    /** Scan and validate a lot number */
    scanLot: (lotNumber: string) => Promise<{ success: boolean; error?: string }>
    /** Authenticate with PIN */
    authenticate: (pin: string, targetRole: Role) => { success: boolean; error?: string }
    /** Switch to operator (no auth needed) */
    switchToOperator: () => void
    /** Clear current lot and return to kiosk */
    clearLot: () => void
    /** End shift - full reset */
    endShift: () => void
    /** Set loading state */
    setIsLoading: (loading: boolean) => void
}

const SessionContext = createContext<SessionContextType | undefined>(undefined)

interface SessionProviderProps {
    children: ReactNode
}

/**
 * Validates lot number format
 */
function isValidLotFormat(lotNumber: string): boolean {
    if (lotNumber.length < 6) return false
    const prefix = lotNumber.substring(0, 3).toUpperCase()
    return VALID_LOT_PREFIXES.includes(prefix) || /^[A-Z0-9]{6,}$/i.test(lotNumber)
}

/**
 * Session provider component for kiosk workflow.
 * Manages lot scanning, authentication, and session state.
 */
export function SessionProvider({ children }: SessionProviderProps) {
    const [scannedLot, setScannedLot] = useState<LotInfo | null>(null)
    const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null)
    const [currentRole, setCurrentRole] = useState<Role>("operator")
    const [isLoading, setIsLoading] = useState(false)

    const isKioskMode = scannedLot === null

    /**
     * Scan and validate a lot number
     */
    const scanLot = useCallback(async (lotNumber: string): Promise<{ success: boolean; error?: string }> => {
        const trimmed = lotNumber.trim().toUpperCase()

        if (!isValidLotFormat(trimmed)) {
            return { success: false, error: "Formato de Lote Inválido" }
        }

        setIsLoading(true)

        // Simulate API fetch delay
        await new Promise(resolve => setTimeout(resolve, 800))

        // For demo, use mock data with the scanned lot number
        const mockLot: LotInfo = {
            ...SCANNED_LOT,
            lotNumber: trimmed,
        }

        setScannedLot(mockLot)
        setIsLoading(false)

        return { success: true }
    }, [])

    /**
     * Authenticate user with PIN
     */
    const authenticate = useCallback((pin: string, targetRole: Role): { success: boolean; error?: string } => {
        const credential = MOCK_CREDENTIALS.find(
            (c: UserCredential) => c.pin === pin && c.role === targetRole
        )

        if (!credential) {
            return { success: false, error: "PIN Incorrecto o Sin Permisos" }
        }

        setCurrentUser({ name: credential.name, role: credential.role })
        setCurrentRole(credential.role)

        return { success: true }
    }, [])

    /**
     * Switch to operator role (no auth required)
     */
    const switchToOperator = useCallback(() => {
        setCurrentRole("operator")
        setCurrentUser(null)
    }, [])

    /**
     * Clear current lot and return to kiosk mode
     */
    const clearLot = useCallback(() => {
        setScannedLot(null)
        setIsLoading(false)
    }, [])

    /**
     * End shift - full reset to initial state
     */
    const endShift = useCallback(() => {
        setScannedLot(null)
        setCurrentUser(null)
        setCurrentRole("operator")
        setIsLoading(false)
    }, [])

    const value: SessionContextType = {
        scannedLot,
        currentUser,
        currentRole,
        isLoading,
        isKioskMode,
        scanLot,
        authenticate,
        switchToOperator,
        clearLot,
        endShift,
        setIsLoading,
    }

    return (
        <SessionContext.Provider value={value}>
            {children}
        </SessionContext.Provider>
    )
}

/**
 * Hook to access session context
 */
export function useSession(): SessionContextType {
    const context = useContext(SessionContext)
    if (context === undefined) {
        throw new Error("useSession must be used within a SessionProvider")
    }
    return context
}
