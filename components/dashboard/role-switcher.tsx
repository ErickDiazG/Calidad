"use client"

/**
 * @fileoverview Header component with role switching, theme toggle, and real-time clock.
 * Provides navigation between Production Operator, Quality Inspector, and Plant Manager roles.
 * @module components/dashboard/role-switcher
 */

import React, { useState, useEffect } from "react"
import { HardHat, ClipboardCheck, BarChart3, Shield, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import type { Role } from "@/lib/data"
import { cn } from "@/lib/utils"

/**
 * Props for the RoleSwitcher component
 * @interface RoleSwitcherProps
 */
interface RoleSwitcherProps {
  /** Current active role */
  currentRole: Role
  /** Callback when role is changed */
  onRoleChange: (role: Role) => void
}

/** Role configuration with label and icon */
const roles: { key: Role; label: string; icon: React.ElementType }[] = [
  { key: "operator", label: "Production Operator", icon: HardHat },
  { key: "inspector", label: "Quality Inspector", icon: ClipboardCheck },
  { key: "manager", label: "Plant Manager", icon: BarChart3 },
]

/**
 * Formats a date to display time in HH:MM:SS format
 * @param {Date} date - The date to format
 * @returns {string} Formatted time string
 */
function formatTime(date: Date): string {
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  })
}

/**
 * Formats a date to display date in short format
 * @param {Date} date - The date to format
 * @returns {string} Formatted date string
 */
function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  })
}

/**
 * Header component with role switching, theme toggle, and real-time clock.
 * Displays system name, current user role, and provides controls for switching between roles.
 * 
 * @param {RoleSwitcherProps} props - Component props
 * @returns {JSX.Element} The rendered header component
 * @example
 * <RoleSwitcher currentRole="operator" onRoleChange={setRole} />
 */
export function RoleSwitcher({ currentRole, onRoleChange }: RoleSwitcherProps) {
  const activeRole = roles.find((r) => r.key === currentRole)
  const [currentTime, setCurrentTime] = useState<Date>(new Date())

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <header className="border-b border-border bg-card">
      <div className="mx-auto flex flex-col gap-4 px-4 py-4 md:flex-row md:items-center md:justify-between md:px-6">
        {/* Logo & System Name */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
            <Shield className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-bold leading-tight text-foreground">
              RBC Quality Control
            </h1>
            <p className="text-xs text-muted-foreground">One-Scan Inspection Workflow</p>
          </div>
        </div>

        {/* Role Selector */}
        <div className="flex items-center gap-2">
          <span className="mr-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Role:
          </span>
          {roles.map((role) => {
            const Icon = role.icon
            const isActive = currentRole === role.key
            return (
              <Button
                key={role.key}
                variant={isActive ? "default" : "outline"}
                size="sm"
                onClick={() => onRoleChange(role.key)}
                className={cn(
                  "gap-2 text-xs md:text-sm",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "border-border text-muted-foreground hover:bg-accent hover:text-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden md:inline">{role.label}</span>
              </Button>
            )
          })}
        </div>

        {/* Right Section: Clock, Role Status, Theme Toggle */}
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

          {/* Current Role Status */}
          {activeRole && (
            <div className="flex items-center gap-2 rounded-lg bg-primary/10 px-3 py-2">
              <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
              <span className="text-xs font-medium text-primary">
                Logged in as {activeRole.label}
              </span>
            </div>
          )}

          {/* Theme Toggle */}
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}

