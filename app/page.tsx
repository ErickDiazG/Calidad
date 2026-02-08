"use client"

/**
 * @fileoverview Main dashboard page for RBC Quality Control.
 * Implements role-based views for Production Operator, Quality Inspector, and Plant Manager.
 * @module app/page
 */

import React from "react"
import { useState, useCallback } from "react"
import { RoleSwitcher } from "@/components/dashboard/role-switcher"
import { LotContext } from "@/components/dashboard/lot-context"
import { OperatorView } from "@/components/dashboard/operator-view"
import { InspectorView } from "@/components/dashboard/inspector-view"
import { ManagerView } from "@/components/dashboard/manager-view"
import { SCANNED_LOT, INITIAL_SPECS, type Role, type InspectionSpec } from "@/lib/data"
import { Badge } from "@/components/ui/badge"
import { HardHat, ClipboardCheck, BarChart3 } from "lucide-react"

/** Role configuration with labels, icons, and descriptions */
const roleConfig: Record<Role, { label: string; icon: React.ElementType; description: string }> = {
  operator: {
    label: "Production Operator",
    icon: HardHat,
    description: "Report output quantities and visual defects for this lot.",
  },
  inspector: {
    label: "Quality Inspector",
    icon: ClipboardCheck,
    description: "Validate dimensional inspections and release or reject the lot.",
  },
  manager: {
    label: "Plant Manager",
    icon: BarChart3,
    description: "Monitor KPIs, defect trends, and review the audit trail.",
  },
}

/**
 * Main dashboard page component.
 * Manages role switching and displays role-specific views.
 * Implements RBAC by passing isReadOnly to InspectorView for non-inspectors
 * and only rendering ManagerView for managers.
 */
export default function Page() {
  const [role, setRole] = useState<Role>("operator")
  const [finishQty, setFinishQty] = useState(3280)
  const [scrapQty, setScrapQty] = useState(20)
  const [selectedDefect, setSelectedDefect] = useState("Z03")
  const [inspectionSpecs, setInspectionSpecs] = useState<InspectionSpec[]>(INITIAL_SPECS)
  const [lotReleased, setLotReleased] = useState(false)
  const [lotRejected, setLotRejected] = useState(false)

  /**
   * Updates an inspection spec with a new actual value and recalculates status
   * @param {number} id - The spec ID to update
   * @param {number | null} actual - The new actual value
   */
  const handleUpdateSpec = useCallback((id: number, actual: number | null) => {
    setInspectionSpecs((prev) =>
      prev.map((spec) => {
        if (spec.id !== id) return spec
        if (actual === null) return { ...spec, actual: null, status: "pending" as const }
        const status = actual >= spec.min && actual <= spec.max ? ("pass" as const) : ("fail" as const)
        return { ...spec, actual, status }
      })
    )
  }, [])

  const config = roleConfig[role]
  const Icon = config.icon

  // RBAC: Determine if inspection inputs should be read-only
  const isInspectionReadOnly = role !== "inspector"

  return (
    <div className="min-h-screen bg-background">
      <RoleSwitcher currentRole={role} onRoleChange={setRole} />

      <main className="mx-auto max-w-7xl px-4 py-6 md:px-6">
        {/* Role Context Banner */}
        <div className="mb-6 flex items-center gap-3 rounded-lg border border-border bg-card p-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
            <Icon className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-foreground">{config.label} View</h2>
              <Badge variant="secondary" className="text-[10px] bg-secondary text-secondary-foreground">
                {role.toUpperCase()}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">{config.description}</p>
          </div>
        </div>

        {/* Lot Context (visible to operators and inspectors, not managers) */}
        {role !== "manager" && (
          <div className="mb-6">
            <LotContext lot={SCANNED_LOT} />
          </div>
        )}

        {/* Role-Specific Views with RBAC Enforcement */}
        {role === "operator" && (
          <OperatorView
            finishQty={finishQty}
            setFinishQty={setFinishQty}
            scrapQty={scrapQty}
            setScrapQty={setScrapQty}
            selectedDefect={selectedDefect}
            setSelectedDefect={setSelectedDefect}
            inspectionSpecs={inspectionSpecs}
          />
        )}

        {role === "inspector" && (
          <InspectorView
            finishQty={finishQty}
            scrapQty={scrapQty}
            selectedDefect={selectedDefect}
            inspectionSpecs={inspectionSpecs}
            onUpdateSpec={handleUpdateSpec}
            lotReleased={lotReleased}
            setLotReleased={setLotReleased}
            lotRejected={lotRejected}
            setLotRejected={setLotRejected}
            isReadOnly={isInspectionReadOnly}
          />
        )}

        {/* RBAC: Manager View only rendered when role === 'manager' */}
        {role === "manager" && <ManagerView />}

        {/* Footer */}
        <footer className="mt-8 border-t border-border pb-6 pt-4 text-center">
          <p className="text-xs text-muted-foreground">
            RBC Quality Control v1.0 &mdash; One-Scan Workflow
          </p>
        </footer>
      </main>
    </div>
  )
}

