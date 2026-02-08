/**
 * @fileoverview Smart search bar for lot number scanning.
 * Auto-focuses on mount and validates lot format.
 * @module components/kiosk/SmartSearchBar
 */

"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Search, Loader2, ScanBarcode, AlertCircle } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

interface SmartSearchBarProps {
    /** Callback when a valid lot is scanned */
    onScan: (lotNumber: string) => Promise<{ success: boolean; error?: string }>
    /** Whether currently loading */
    isLoading?: boolean
    /** Whether the input is disabled */
    disabled?: boolean
}

/**
 * Smart search bar component for lot number scanning.
 * Features auto-focus, barcode scanner optimization, and format validation.
 */
export function SmartSearchBar({ onScan, isLoading = false, disabled = false }: SmartSearchBarProps) {
    const [value, setValue] = useState("")
    const [hasError, setHasError] = useState(false)
    const inputRef = useRef<HTMLInputElement>(null)

    // Auto-focus on mount
    useEffect(() => {
        if (inputRef.current && !disabled) {
            inputRef.current.focus()
        }
    }, [disabled])

    // Re-focus after loading completes
    useEffect(() => {
        if (!isLoading && inputRef.current && !disabled) {
            inputRef.current.focus()
        }
    }, [isLoading, disabled])

    /**
     * Handle scan submission
     */
    const handleScan = useCallback(async () => {
        if (!value.trim() || isLoading || disabled) return

        setHasError(false)
        const result = await onScan(value.trim())

        if (!result.success) {
            setHasError(true)
            toast.error(result.error || "Error al escanear lote", {
                description: "Verifique el formato e intente nuevamente.",
                icon: <AlertCircle className="h-4 w-4" />,
            })

            // Clear error state after delay
            setTimeout(() => setHasError(false), 3000)
        } else {
            setValue("")
            toast.success("Lote Escaneado", {
                description: `Cargando datos del lote ${value.trim().toUpperCase()}...`,
            })
        }
    }, [value, isLoading, disabled, onScan])

    /**
     * Handle key press (Enter to submit)
     */
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            e.preventDefault()
            handleScan()
        }
    }

    /**
     * Handle input change
     */
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setValue(e.target.value.toUpperCase())
        if (hasError) setHasError(false)
    }

    return (
        <div className="w-full max-w-2xl mx-auto">
            {/* Header */}
            <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                    <ScanBarcode className="h-8 w-8 text-primary" />
                </div>
                <h2 className="text-2xl font-bold text-foreground mb-2">
                    Escanear Lote
                </h2>
                <p className="text-muted-foreground">
                    Escanee el código de barras o ingrese el número de lote manualmente
                </p>
            </div>

            {/* Search Input */}
            <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
                    {isLoading ? (
                        <Loader2 className="h-6 w-6 text-primary animate-spin" />
                    ) : (
                        <Search className={cn("h-6 w-6", hasError ? "text-destructive" : "text-muted-foreground")} />
                    )}
                </div>

                <Input
                    ref={inputRef}
                    type="text"
                    value={value}
                    onChange={handleChange}
                    onKeyDown={handleKeyDown}
                    placeholder="Escanee o ingrese Lote (e.g., STD260305)"
                    disabled={isLoading || disabled}
                    className={cn(
                        "h-16 pl-14 pr-32 text-lg font-mono",
                        "border-2 bg-card text-foreground",
                        "placeholder:text-muted-foreground/50",
                        "focus:ring-2 focus:ring-primary/20",
                        "transition-all duration-200",
                        hasError && "border-destructive bg-destructive/5 focus:ring-destructive/20",
                        !hasError && "border-border hover:border-primary/50 focus:border-primary"
                    )}
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="characters"
                    spellCheck={false}
                />

                <Button
                    onClick={handleScan}
                    disabled={!value.trim() || isLoading || disabled}
                    className={cn(
                        "absolute right-2 top-1/2 -translate-y-1/2",
                        "h-12 px-6 font-semibold",
                        "bg-primary text-primary-foreground hover:bg-primary/90"
                    )}
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Buscando...
                        </>
                    ) : (
                        "Buscar"
                    )}
                </Button>
            </div>

            {/* Help Text */}
            <p className="text-center text-xs text-muted-foreground mt-4">
                💡 Presione <kbd className="px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-mono text-[10px]">Enter</kbd> para buscar
            </p>
        </div>
    )
}
