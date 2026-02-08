/**
 * @fileoverview Authentication context for role-based access control.
 * Provides current role and permission checking throughout the application.
 * @module context/AuthContext
 */

"use client"

import React, { createContext, useContext, useState, useCallback, type ReactNode } from "react"
import type { Role } from "@/lib/data"

/**
 * Permission definitions for each role
 * @constant
 */
const ROLE_PERMISSIONS: Record<Role, string[]> = {
    operator: [
        "view_lot_context",
        "edit_production_output",
        "select_defect_code",
        "view_inspection_specs",
    ],
    inspector: [
        "view_lot_context",
        "view_production_output",
        "view_defect_code",
        "view_inspection_specs",
        "edit_inspection_values",
        "release_lot",
        "reject_lot",
    ],
    manager: [
        "view_kpis",
        "view_audit_log",
        "view_defect_trends",
        "download_reports",
    ],
    admin_engineer: [
        // Master Data Management
        "manage_parts",
        "create_part",
        "edit_part",
        "delete_part",
        // Versioning & Revisions
        "manage_revisions",
        "create_revision",
        "view_revision_history",
        // Blueprint Management
        "manage_blueprints",
        "upload_blueprint",
        "delete_blueprint",
        // System Configuration
        "configure_system",
        "view_all_audit",
        // Inherits inspection viewing
        "view_lot_context",
        "view_inspection_specs",
        "view_kpis",
        "view_audit_log",
    ],
}

/**
 * Auth context type definition
 * @interface AuthContextType
 */
interface AuthContextType {
    /** Current active role */
    role: Role
    /** Function to change the current role */
    setRole: (role: Role) => void
    /** Check if current role has a specific permission */
    hasPermission: (permission: string) => boolean
    /** Check if current role matches the specified role */
    isRole: (targetRole: Role) => boolean
    /** Check if user can edit inspection values */
    canEditInspection: boolean
    /** Check if user can view manager dashboard */
    canViewManagerDashboard: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

/**
 * Props for AuthProvider component
 * @interface AuthProviderProps
 */
interface AuthProviderProps {
    /** Child components */
    children: ReactNode
    /** Initial role (defaults to operator) */
    initialRole?: Role
}

/**
 * Authentication provider component.
 * Wraps the application to provide role-based access control.
 * 
 * @param {AuthProviderProps} props - Component props
 * @returns {JSX.Element} Provider component
 * @example
 * <AuthProvider initialRole="operator">
 *   <App />
 * </AuthProvider>
 */
export function AuthProvider({ children, initialRole = "operator" }: AuthProviderProps) {
    const [role, setRole] = useState<Role>(initialRole)

    /**
     * Check if the current role has a specific permission
     * @param {string} permission - The permission to check
     * @returns {boolean} True if the role has the permission
     */
    const hasPermission = useCallback(
        (permission: string): boolean => {
            return ROLE_PERMISSIONS[role]?.includes(permission) ?? false
        },
        [role]
    )

    /**
     * Check if the current role matches the target role
     * @param {Role} targetRole - The role to check against
     * @returns {boolean} True if roles match
     */
    const isRole = useCallback(
        (targetRole: Role): boolean => {
            return role === targetRole
        },
        [role]
    )

    // Derived permissions for common checks
    const canEditInspection = role === "inspector"
    const canViewManagerDashboard = role === "manager"

    const value: AuthContextType = {
        role,
        setRole,
        hasPermission,
        isRole,
        canEditInspection,
        canViewManagerDashboard,
    }

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

/**
 * Hook to access authentication context.
 * Must be used within an AuthProvider.
 * 
 * @returns {AuthContextType} The auth context value
 * @throws {Error} If used outside of AuthProvider
 * @example
 * const { role, hasPermission } = useAuth()
 * if (hasPermission('edit_inspection_values')) {
 *   // show edit controls
 * }
 */
export function useAuth(): AuthContextType {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider")
    }
    return context
}

/**
 * Export role permissions for external use
 */
export { ROLE_PERMISSIONS }
