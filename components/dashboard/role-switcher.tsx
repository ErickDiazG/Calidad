"use client"

import React from "react"

import { HardHat, ClipboardCheck, BarChart3, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Role } from "@/lib/data"
import { cn } from "@/lib/utils"

interface RoleSwitcherProps {
  currentRole: Role
  onRoleChange: (role: Role) => void
}

const roles: { key: Role; label: string; icon: React.ElementType }[] = [
  { key: "operator", label: "Production Operator", icon: HardHat },
  { key: "inspector", label: "Quality Inspector", icon: ClipboardCheck },
  { key: "manager", label: "Plant Manager", icon: BarChart3 },
]

export function RoleSwitcher({ currentRole, onRoleChange }: RoleSwitcherProps) {
  const activeRole = roles.find((r) => r.key === currentRole)

  return (
    <header className="border-b border-border bg-card">
      <div className="mx-auto flex flex-col gap-4 px-4 py-4 md:flex-row md:items-center md:justify-between md:px-6">
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

        {activeRole && (
          <div className="flex items-center gap-2 rounded-lg bg-primary/10 px-3 py-2">
            <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
            <span className="text-xs font-medium text-primary">
              Logged in as {activeRole.label}
            </span>
          </div>
        )}
      </div>
    </header>
  )
}
