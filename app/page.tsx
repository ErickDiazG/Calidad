/**
 * @fileoverview Main dashboard page for RBC Quality Control.
 * Implements One-Scan Kiosk Workflow with role-based access.
 * @module app/page
 */

"use client"

import React, { useState, useCallback } from "react"
import { RoleSwitcher } from "@/components/dashboard/role-switcher"
import { LotContext } from "@/components/dashboard/lot-context"
import { OperatorView } from "@/components/dashboard/operator-view"
import { InspectorView } from "@/components/dashboard/inspector-view"
import { ManagerView } from "@/components/dashboard/manager-view"
import { KioskView } from "@/components/kiosk/KioskView"
import { SessionProvider, useSession } from "@/context/SessionContext"
import { INITIAL_SPECS, type Role, type InspectionSpec } from "@/lib/data"
import { Badge } from "@/components/ui/badge"
import { HardHat, ClipboardCheck, BarChart3 } from "lucide-react"
import { toast } from "sonner"

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
 * Dashboard content component (uses session context)
 */
function DashboardContent() {
  const {
    scannedLot,
    currentRole,
    currentUser,
    isKioskMode,
    authenticate,
    switchToOperator,
    endShift,
  } = useSession()

  // Local form state for operator view
  const [finishQty, setFinishQty] = useState(3280)
  const [scrapQty, setScrapQty] = useState(20)
  const [selectedDefect, setSelectedDefect] = useState("Z03")
  const [inspectionSpecs, setInspectionSpecs] = useState<InspectionSpec[]>(INITIAL_SPECS)
  const [lotReleased, setLotReleased] = useState(false)
  const [lotRejected, setLotRejected] = useState(false)

  /**
   * Updates an inspection spec with a new actual value
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

  /**
   * Handle role change (auth or direct switch)
   */
  const handleRoleChange = useCallback((role: Role) => {
    if (role === "operator") {
      switchToOperator()
    }
    // For inspector/manager, the RoleSwitcher opens the auth modal
  }, [switchToOperator])

  /**
   * Handle authentication attempt
   */
  const handleAuthenticate = useCallback((pin: string, role: Role) => {
    const result = authenticate(pin, role)
    if (result.success) {
      toast.success(`Autenticado como ${roleConfig[role].label}`, {
        description: "Acceso concedido al sistema.",
      })
    } else {
      toast.error(result.error || "Error de autenticación", {
        description: "Verifique su PIN e intente nuevamente.",
      })
    }
    return result
  }, [authenticate])

  /**
   * Handle end shift
   */
  const handleEndShift = useCallback(() => {
    endShift()
    // Reset local state
    setInspectionSpecs(INITIAL_SPECS)
    setLotReleased(false)
    setLotRejected(false)
    setFinishQty(3280)
    setScrapQty(20)
    setSelectedDefect("Z03")
    toast.info("Turno Finalizado", {
      description: "Sistema reiniciado. Escanee un nuevo lote para continuar.",
    })
  }, [endShift])

  const config = roleConfig[currentRole]
  const Icon = config.icon
  const isInspectionReadOnly = currentRole !== "inspector"

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <RoleSwitcher
        currentRole={currentRole}
        currentUser={currentUser?.name || null}
        onRoleChange={handleRoleChange}
        onAuthenticate={handleAuthenticate}
        onEndShift={handleEndShift}
        hasScannedLot={!isKioskMode}
      />

      <main className="flex-grow mx-auto w-full max-w-7xl px-4 py-6 md:px-6">
        {/* Kiosk Mode: Show search bar and skeletons */}
        {isKioskMode ? (
          <KioskView />
        ) : (
          /* Dashboard Mode: Show actual content */
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Role Context Banner */}
            <div className="mb-6 flex items-center gap-3 rounded-lg border border-border bg-card p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-bold text-foreground">{config.label} View</h2>
                  <Badge variant="secondary" className="text-[10px] bg-secondary text-secondary-foreground">
                    {currentRole.toUpperCase()}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">{config.description}</p>
              </div>
            </div>

            {/* Lot Context (visible to operators and inspectors) */}
            {currentRole !== "manager" && scannedLot && (
              <div className="mb-6">
                <LotContext lot={scannedLot} />
              </div>
            )}

            {/* Role-Specific Views with RBAC Enforcement */}
            {currentRole === "operator" && (
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

            {currentRole === "inspector" && (
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

            {currentRole === "manager" && <ManagerView />}
          </div>
        )}
      </main>

      {/* Static Branded Footer - at end of document flow */}
      <footer className="border-t border-border bg-card py-4 px-4 md:px-6 mt-auto">
        <div className="mx-auto max-w-7xl flex items-center justify-between">
          <p className="text-xs text-gray-600 dark:text-gray-400">
            RBC Quality Control v2.0
          </p>
          <a
            href="https://devdiazlabs.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-zinc-500 hover:text-cyan-500 hover:underline underline-offset-2 transition-colors duration-200"
          >
            Developed by DevDiaz Labs
          </a>
        </div>
      </footer>
    </div>
  )
}

/**
 * Main page component wrapped with SessionProvider
 */
export default function Page() {
  return (
    <SessionProvider>
      <DashboardContent />
    </SessionProvider>
  )
}
