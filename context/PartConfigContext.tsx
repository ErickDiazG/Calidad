/**
 * @fileoverview Part Configuration context for managing dynamic part models.
 * Handles part creation, versioning, revisions, and localStorage persistence.
 * @module context/PartConfigContext
 */

"use client"

import React, { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react"
import type { PartConfig, PartRevision, FieldDefinition } from "@/lib/data"
import { INITIAL_PART_CONFIGS, INITIAL_REVISIONS } from "@/lib/data"

// ==========================================
// TYPES
// ==========================================

interface PartConfigContextType {
    /** All part configurations */
    parts: PartConfig[]
    /** All revisions for all parts */
    revisions: PartRevision[]
    /** Loading state */
    isLoading: boolean

    // Part CRUD Operations
    createPart: (part: Omit<PartConfig, "id" | "createdAt" | "updatedAt">) => PartConfig
    updatePart: (id: string, updates: Partial<PartConfig>) => void
    deletePart: (id: string) => void
    getPartById: (id: string) => PartConfig | undefined
    getPartByNumber: (partNumber: string) => PartConfig | undefined

    // Revision Operations
    createRevision: (partId: string, changeNote: string, createdBy: string) => PartRevision
    getRevisionsByPart: (partId: string) => PartRevision[]
    getActiveRevision: (partId: string) => PartRevision | undefined

    // Field Operations
    addField: (partId: string, field: FieldDefinition) => void
    updateField: (partId: string, fieldId: string, updates: Partial<FieldDefinition>) => void
    removeField: (partId: string, fieldId: string) => void
    reorderFields: (partId: string, fieldIds: string[]) => void
}

const PartConfigContext = createContext<PartConfigContextType | undefined>(undefined)

// ==========================================
// LOCAL STORAGE KEYS
// ==========================================
const STORAGE_KEYS = {
    parts: "rbc_qc_parts",
    revisions: "rbc_qc_revisions",
}

// ==========================================
// HELPER FUNCTIONS
// ==========================================

function generateId(prefix: string): string {
    return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 9)}`
}

function getNextRevision(currentRevision: string): string {
    // Extract letter from "Rev A", "Rev B", etc.
    const match = currentRevision.match(/Rev\s*([A-Z])/i)
    if (match) {
        const currentLetter = match[1].toUpperCase()
        const nextLetter = String.fromCharCode(currentLetter.charCodeAt(0) + 1)
        return `Rev ${nextLetter}`
    }
    return "Rev A"
}

// ==========================================
// PROVIDER
// ==========================================

interface PartConfigProviderProps {
    children: ReactNode
}

export function PartConfigProvider({ children }: PartConfigProviderProps) {
    const [parts, setParts] = useState<PartConfig[]>([])
    const [revisions, setRevisions] = useState<PartRevision[]>([])
    const [isLoading, setIsLoading] = useState(true)

    // Load from localStorage on mount
    useEffect(() => {
        const loadFromStorage = () => {
            try {
                const storedParts = localStorage.getItem(STORAGE_KEYS.parts)
                const storedRevisions = localStorage.getItem(STORAGE_KEYS.revisions)

                if (storedParts) {
                    setParts(JSON.parse(storedParts))
                } else {
                    // Initialize with demo data
                    setParts(INITIAL_PART_CONFIGS)
                    localStorage.setItem(STORAGE_KEYS.parts, JSON.stringify(INITIAL_PART_CONFIGS))
                }

                if (storedRevisions) {
                    setRevisions(JSON.parse(storedRevisions))
                } else {
                    // Initialize with demo data
                    setRevisions(INITIAL_REVISIONS)
                    localStorage.setItem(STORAGE_KEYS.revisions, JSON.stringify(INITIAL_REVISIONS))
                }
            } catch (error) {
                console.error("Error loading part configs from localStorage:", error)
                // Fallback to demo data
                setParts(INITIAL_PART_CONFIGS)
                setRevisions(INITIAL_REVISIONS)
            } finally {
                setIsLoading(false)
            }
        }

        loadFromStorage()
    }, [])

    // Persist parts to localStorage whenever they change
    useEffect(() => {
        if (!isLoading && parts.length > 0) {
            localStorage.setItem(STORAGE_KEYS.parts, JSON.stringify(parts))
        }
    }, [parts, isLoading])

    // Persist revisions to localStorage whenever they change
    useEffect(() => {
        if (!isLoading && revisions.length > 0) {
            localStorage.setItem(STORAGE_KEYS.revisions, JSON.stringify(revisions))
        }
    }, [revisions, isLoading])

    // ==========================================
    // PART CRUD OPERATIONS
    // ==========================================

    const createPart = useCallback((partData: Omit<PartConfig, "id" | "createdAt" | "updatedAt">): PartConfig => {
        const now = new Date().toISOString()
        const newPart: PartConfig = {
            ...partData,
            id: generateId("part"),
            createdAt: now,
            updatedAt: now,
        }

        setParts(prev => [...prev, newPart])

        // Create initial revision
        const initialRevision: PartRevision = {
            id: generateId("rev"),
            partConfigId: newPart.id,
            revision: partData.currentRevision || "Rev A",
            fields: [...partData.fields],
            changeNote: "Initial release",
            createdAt: now,
            createdBy: "System",
        }
        setRevisions(prev => [...prev, initialRevision])

        return newPart
    }, [])

    const updatePart = useCallback((id: string, updates: Partial<PartConfig>) => {
        setParts(prev => prev.map(part => {
            if (part.id !== id) return part
            return {
                ...part,
                ...updates,
                updatedAt: new Date().toISOString(),
            }
        }))
    }, [])

    const deletePart = useCallback((id: string) => {
        setParts(prev => prev.filter(part => part.id !== id))
        // Also delete all revisions for this part
        setRevisions(prev => prev.filter(rev => rev.partConfigId !== id))
    }, [])

    const getPartById = useCallback((id: string): PartConfig | undefined => {
        return parts.find(part => part.id === id)
    }, [parts])

    const getPartByNumber = useCallback((partNumber: string): PartConfig | undefined => {
        return parts.find(part => part.partNumber.toLowerCase() === partNumber.toLowerCase())
    }, [parts])

    // ==========================================
    // REVISION OPERATIONS
    // ==========================================

    const createRevision = useCallback((partId: string, changeNote: string, createdBy: string): PartRevision => {
        const part = parts.find(p => p.id === partId)
        if (!part) {
            throw new Error(`Part with ID ${partId} not found`)
        }

        const nextRevision = getNextRevision(part.currentRevision)
        const now = new Date().toISOString()

        const newRevision: PartRevision = {
            id: generateId("rev"),
            partConfigId: partId,
            revision: nextRevision,
            fields: [...part.fields],
            blueprintUrl: part.blueprintUrl,
            changeNote,
            createdAt: now,
            createdBy,
        }

        setRevisions(prev => [...prev, newRevision])

        // Update part's current revision
        updatePart(partId, { currentRevision: nextRevision })

        return newRevision
    }, [parts, updatePart])

    const getRevisionsByPart = useCallback((partId: string): PartRevision[] => {
        return revisions
            .filter(rev => rev.partConfigId === partId)
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    }, [revisions])

    const getActiveRevision = useCallback((partId: string): PartRevision | undefined => {
        const part = parts.find(p => p.id === partId)
        if (!part) return undefined

        return revisions.find(
            rev => rev.partConfigId === partId && rev.revision === part.currentRevision
        )
    }, [parts, revisions])

    // ==========================================
    // FIELD OPERATIONS
    // ==========================================

    const addField = useCallback((partId: string, field: FieldDefinition) => {
        setParts(prev => prev.map(part => {
            if (part.id !== partId) return part
            return {
                ...part,
                fields: [...part.fields, field],
                updatedAt: new Date().toISOString(),
            }
        }))
    }, [])

    const updateField = useCallback((partId: string, fieldId: string, updates: Partial<FieldDefinition>) => {
        setParts(prev => prev.map(part => {
            if (part.id !== partId) return part
            return {
                ...part,
                fields: part.fields.map(field => {
                    if (field.id !== fieldId) return field
                    return { ...field, ...updates }
                }),
                updatedAt: new Date().toISOString(),
            }
        }))
    }, [])

    const removeField = useCallback((partId: string, fieldId: string) => {
        setParts(prev => prev.map(part => {
            if (part.id !== partId) return part
            return {
                ...part,
                fields: part.fields.filter(field => field.id !== fieldId),
                updatedAt: new Date().toISOString(),
            }
        }))
    }, [])

    const reorderFields = useCallback((partId: string, fieldIds: string[]) => {
        setParts(prev => prev.map(part => {
            if (part.id !== partId) return part
            const orderedFields = fieldIds
                .map(id => part.fields.find(f => f.id === id))
                .filter((f): f is FieldDefinition => f !== undefined)
            return {
                ...part,
                fields: orderedFields,
                updatedAt: new Date().toISOString(),
            }
        }))
    }, [])

    // ==========================================
    // CONTEXT VALUE
    // ==========================================

    const value: PartConfigContextType = {
        parts,
        revisions,
        isLoading,
        createPart,
        updatePart,
        deletePart,
        getPartById,
        getPartByNumber,
        createRevision,
        getRevisionsByPart,
        getActiveRevision,
        addField,
        updateField,
        removeField,
        reorderFields,
    }

    return (
        <PartConfigContext.Provider value={value}>
            {children}
        </PartConfigContext.Provider>
    )
}

// ==========================================
// HOOK
// ==========================================

export function usePartConfig(): PartConfigContextType {
    const context = useContext(PartConfigContext)
    if (context === undefined) {
        throw new Error("usePartConfig must be used within a PartConfigProvider")
    }
    return context
}
