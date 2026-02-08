/**
 * @fileoverview Role switcher component with auth modal integration.
 * Shows current role, user name, and session controls.
 * @module components/dashboard/role-switcher
 */

"use client"

import { useState, useEffect } from "react"
import { HardHat, ClipboardCheck, BarChart3, Clock, LogOut, User, Settings2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { AuthModal } from "@/components/auth/AuthModal"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import type { Role } from "@/lib/data"

/**
 * Role configuration with labels and icons
 */
const ROLES: { id: Role; label: string; icon: React.ElementType; requiresAuth: boolean }[] = [
  { id: "operator", label: "Operador", icon: HardHat, requiresAuth: false },
  { id: "inspector", label: "Inspector", icon: ClipboardCheck, requiresAuth: true },
  { id: "manager", label: "Manager", icon: BarChart3, requiresAuth: true },
  { id: "admin_engineer", label: "Ingeniero", icon: Settings2, requiresAuth: true },
]

interface RoleSwitcherProps {
  /** Current active role */
  currentRole: Role
  /** Current user name (if authenticated) */
  currentUser: string | null
  /** Callback when role changes */
  onRoleChange: (role: Role) => void
  /** Callback to authenticate for a role */
  onAuthenticate: (pin: string, role: Role) => { success: boolean; error?: string }
  /** Callback when shift ends */
  onEndShift: () => void
  /** Whether a lot is currently scanned */
  hasScannedLot: boolean
}

/**
 * Format time as HH:MM:SS
 */
function formatTime(date: Date): string {
  return format(date, "HH:mm:ss")
}

/**
 * Format date as DD MMM YYYY
 */
function formatDate(date: Date): string {
  return format(date, "dd MMM yyyy")
}

/**
 * Role switcher component with authentication modal.
 * Displays the header with role selection, clock, and session controls.
 */
export function RoleSwitcher({
  currentRole,
  currentUser,
  onRoleChange,
  onAuthenticate,
  onEndShift,
  hasScannedLot,
}: RoleSwitcherProps) {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [targetRole, setTargetRole] = useState<Role>("inspector")

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  /**
   * Handle role button click
   */
  const handleRoleClick = (role: Role) => {
    const roleConfig = ROLES.find(r => r.id === role)

    if (!roleConfig?.requiresAuth) {
      // Operator doesn't need auth
      onRoleChange(role)
    } else if (currentRole === role) {
      // Already in this role
      return
    } else {
      // Open auth modal for protected roles
      setTargetRole(role)
      setAuthModalOpen(true)
    }
  }

  /**
   * Handle successful authentication
   */
  const handleAuthSuccess = (pin: string) => {
    const result = onAuthenticate(pin, targetRole)
    if (result.success) {
      setAuthModalOpen(false)
    }
  }

  const activeRoleConfig = ROLES.find(r => r.id === currentRole)

  return (
    <>
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex flex-col gap-4 px-4 py-4 md:flex-row md:items-center md:justify-between md:px-6">
          {/* Left: Logo & Title */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <ClipboardCheck className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-foreground">RBC Quality Control</h1>
                <p className="text-xs text-muted-foreground">One-Scan Workflow</p>
              </div>
            </div>
          </div>

          {/* Center: Role Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground mr-2">Rol:</span>
            {ROLES.map((role) => {
              const Icon = role.icon
              const isActive = currentRole === role.id
              return (
                <Button
                  key={role.id}
                  variant={isActive ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleRoleClick(role.id)}
                  className={cn(
                    "gap-2 transition-all duration-200",
                    isActive && "bg-primary text-primary-foreground",
                    !isActive && "border-border hover:bg-muted"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{role.label}</span>
                </Button>
              )
            })}
          </div>

          {/* Right: Clock, User, Controls */}
          <div className="flex items-center gap-3">
            {/* Real-time Clock */}
            <div className="hidden lg:flex items-center gap-2 rounded-lg border border-border bg-muted/50 px-3 py-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <div className="flex flex-col">
                <span suppressHydrationWarning className="text-xs font-mono font-semibold text-foreground">
                  {formatTime(currentTime)}
                </span>
                <span suppressHydrationWarning className="text-[10px] text-muted-foreground">
                  {formatDate(currentTime)}
                </span>
              </div>
            </div>

            {/* Current User */}
            {currentUser && (
              <div className="flex items-center gap-2 rounded-lg bg-primary/10 px-3 py-2">
                <User className="h-4 w-4 text-primary" />
                <div className="flex flex-col">
                  <span className="text-xs font-medium text-primary">
                    {activeRoleConfig?.label}
                  </span>
                  <span className="text-[10px] text-primary/70">
                    {currentUser}
                  </span>
                </div>
              </div>
            )}

            {/* End Shift Button */}
            {hasScannedLot && (
              <Button
                variant="outline"
                size="sm"
                onClick={onEndShift}
                className="gap-2 border-border text-muted-foreground hover:text-destructive hover:border-destructive"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Finalizar Turno</span>
              </Button>
            )}

            {/* Theme Toggle */}
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        targetRole={targetRole}
        onSuccess={handleAuthSuccess}
      />
    </>
  )
}
