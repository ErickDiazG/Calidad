/**
 * @fileoverview Authentication modal for role switching.
 * Prompts for PIN to access Inspector or Manager roles.
 * @module components/auth/AuthModal
 */

"use client"

import { useState, useRef, useEffect } from "react"
import { Shield, KeyRound, X, Loader2, AlertCircle, UserCheck } from "lucide-react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { Role } from "@/lib/data"

interface AuthModalProps {
    /** Whether the modal is open */
    isOpen: boolean
    /** Callback to close the modal */
    onClose: () => void
    /** Target role to authenticate for */
    targetRole: Role
    /** Callback when authentication succeeds */
    onSuccess: (pin: string) => void
}

const ROLE_CONFIG: Record<Role, { label: string; color: string }> = {
    operator: { label: "Production Operator", color: "text-blue-400" },
    inspector: { label: "Quality Inspector", color: "text-amber-400" },
    manager: { label: "Plant Manager", color: "text-purple-400" },
    admin_engineer: { label: "Engineering Manager", color: "text-cyan-400" },
}

/**
 * Authentication modal component.
 * Displays a PIN input for elevated role access.
 */
export function AuthModal({ isOpen, onClose, targetRole, onSuccess }: AuthModalProps) {
    const [pin, setPin] = useState("")
    const [error, setError] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const inputRef = useRef<HTMLInputElement>(null)

    const roleConfig = ROLE_CONFIG[targetRole]

    // Focus input when modal opens
    useEffect(() => {
        if (isOpen && inputRef.current) {
            setTimeout(() => inputRef.current?.focus(), 100)
        }
    }, [isOpen])

    // Reset state when modal closes
    useEffect(() => {
        if (!isOpen) {
            setPin("")
            setError(null)
            setIsLoading(false)
        }
    }, [isOpen])

    /**
     * Handle PIN submission
     */
    const handleSubmit = async (e?: React.FormEvent) => {
        e?.preventDefault()

        if (pin.length < 4) {
            setError("PIN debe tener al menos 4 dígitos")
            return
        }

        setIsLoading(true)
        setError(null)

        // Simulate auth delay
        await new Promise(resolve => setTimeout(resolve, 500))

        // Pass PIN to parent for validation
        onSuccess(pin)
    }

    /**
     * Handle PIN input change
     */
    const handlePinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/\D/g, "").slice(0, 6)
        setPin(value)
        if (error) setError(null)
    }

    /**
     * Handle key press
     */
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && pin.length >= 4) {
            handleSubmit()
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-md bg-card border-border">
                <DialogHeader>
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                        <Shield className={cn("h-8 w-8", roleConfig.color)} />
                    </div>
                    <DialogTitle className="text-center text-xl text-foreground">
                        Autenticación Requerida
                    </DialogTitle>
                    <DialogDescription className="text-center text-muted-foreground">
                        Ingrese su PIN para acceder como{" "}
                        <span className={cn("font-semibold", roleConfig.color)}>
                            {roleConfig.label}
                        </span>
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6 py-4">
                    {/* PIN Input */}
                    <div className="space-y-2">
                        <div className="relative">
                            <KeyRound className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                ref={inputRef}
                                type="password"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                value={pin}
                                onChange={handlePinChange}
                                onKeyDown={handleKeyDown}
                                placeholder="Ingrese PIN de Acceso"
                                disabled={isLoading}
                                className={cn(
                                    "h-14 pl-12 text-center text-2xl font-mono tracking-[0.5em]",
                                    "border-2 bg-muted/30",
                                    error && "border-destructive bg-destructive/5"
                                )}
                                autoComplete="off"
                            />
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="flex items-center justify-center gap-2 text-sm text-destructive">
                                <AlertCircle className="h-4 w-4" />
                                <span>{error}</span>
                            </div>
                        )}

                        {/* Hint */}
                        <p className="text-center text-xs text-muted-foreground">
                            💡 También puede escanear su gafete de identificación
                        </p>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            className="flex-1 h-12 border-border"
                            disabled={isLoading}
                        >
                            <X className="h-4 w-4 mr-2" />
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            className="flex-1 h-12 bg-primary text-primary-foreground hover:bg-primary/90"
                            disabled={pin.length < 4 || isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Verificando...
                                </>
                            ) : (
                                <>
                                    <UserCheck className="h-4 w-4 mr-2" />
                                    Acceder
                                </>
                            )}
                        </Button>
                    </div>
                </form>

                {/* Demo Hint */}
                <div className="border-t border-border pt-4">
                    <p className="text-center text-xs text-muted-foreground">
                        Demo PINs: Inspector <code className="px-1 bg-muted rounded">1234</code> | Manager <code className="px-1 bg-muted rounded">5678</code> | Ingeniero <code className="px-1 bg-muted rounded">9999</code>
                    </p>
                </div>
            </DialogContent>
        </Dialog>
    )
}
