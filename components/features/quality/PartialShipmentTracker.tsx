/**
 * @fileoverview Partial shipment tracker component.
 * Tracks partial shipments and remaining quantities with validation.
 * @module components/features/quality/PartialShipmentTracker
 */

"use client"

import React, { useState, useMemo, useCallback } from "react"
import { Package, TrendingDown, AlertCircle, CheckCircle, Plus } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import type { PartialShipment } from "@/lib/data"

// ==========================================
// TYPES
// ==========================================

interface PartialShipmentTrackerProps {
    /** Order ID for tracking */
    orderId: string
    /** Lot number */
    lotNumber: string
    /** Total quantity required for the order */
    totalQty: number
    /** Previous partial shipments */
    shipments: PartialShipment[]
    /** Callback when new shipment is added */
    onAddShipment: (shipment: PartialShipment) => void
    /** Current inspector name */
    inspectorName?: string
    /** Whether adding is disabled */
    isDisabled?: boolean
}

// ==========================================
// MAIN COMPONENT
// ==========================================

export function PartialShipmentTracker({
    orderId,
    lotNumber,
    totalQty,
    shipments,
    onAddShipment,
    inspectorName = "Inspector",
    isDisabled = false,
}: PartialShipmentTrackerProps) {
    const [showAddDialog, setShowAddDialog] = useState(false)
    const [inputQty, setInputQty] = useState("")
    const [inputError, setInputError] = useState<string | null>(null)

    // Calculate quantities
    const calculations = useMemo(() => {
        const shippedQty = shipments.reduce((sum, s) => sum + s.quantity, 0)
        const remainingQty = totalQty - shippedQty
        const progressPercent = totalQty > 0 ? (shippedQty / totalQty) * 100 : 0
        const isComplete = remainingQty <= 0
        return { shippedQty, remainingQty, progressPercent, isComplete }
    }, [totalQty, shipments])

    // Validate input quantity
    const validateQty = useCallback((value: string): string | null => {
        if (!value.trim()) return "Quantity is required"
        const qty = parseInt(value, 10)
        if (isNaN(qty)) return "Invalid number"
        if (qty <= 0) return "Quantity must be greater than 0"
        if (qty > calculations.remainingQty) {
            return `Cannot exceed remaining quantity (${calculations.remainingQty})`
        }
        return null
    }, [calculations.remainingQty])

    // Handle input change
    const handleInputChange = (value: string) => {
        setInputQty(value)
        setInputError(validateQty(value))
    }

    // Handle add shipment
    const handleAddShipment = () => {
        const error = validateQty(inputQty)
        if (error) {
            setInputError(error)
            return
        }

        const qty = parseInt(inputQty, 10)
        const newShipment: PartialShipment = {
            id: `ship-${Date.now()}`,
            orderId,
            lotNumber,
            quantity: qty,
            timestamp: new Date().toISOString(),
            inspectedBy: inspectorName,
        }

        onAddShipment(newShipment)

        toast.success("Partial Shipment Recorded", {
            description: `${qty} units added. Remaining: ${calculations.remainingQty - qty}`,
        })

        setShowAddDialog(false)
        setInputQty("")
        setInputError(null)
    }

    return (
        <Card className="border-border bg-card">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-sm font-semibold text-foreground">
                        <Package className="h-4 w-4 text-primary" />
                        Partial Shipments Tracking
                    </CardTitle>
                    {calculations.isComplete ? (
                        <Badge className="bg-success/20 text-success border-0">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Complete
                        </Badge>
                    ) : (
                        <Badge variant="outline">
                            {calculations.remainingQty} Remaining
                        </Badge>
                    )}
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Summary Cards */}
                <div className="grid grid-cols-3 gap-3">
                    <div className="rounded-lg border border-border bg-muted/30 p-3 text-center">
                        <p className="text-xs text-muted-foreground">Total Required</p>
                        <p className="text-xl font-bold font-mono text-foreground">{totalQty.toLocaleString()}</p>
                    </div>
                    <div className="rounded-lg border border-border bg-muted/30 p-3 text-center">
                        <p className="text-xs text-muted-foreground">Shipped</p>
                        <p className="text-xl font-bold font-mono text-success">{calculations.shippedQty.toLocaleString()}</p>
                    </div>
                    <div className={cn(
                        "rounded-lg border p-3 text-center",
                        calculations.remainingQty > 0
                            ? "border-amber-500/30 bg-amber-500/10"
                            : "border-success/30 bg-success/10"
                    )}>
                        <p className="text-xs text-muted-foreground">Remaining</p>
                        <p className={cn(
                            "text-xl font-bold font-mono",
                            calculations.remainingQty > 0 ? "text-amber-600" : "text-success"
                        )}>
                            {calculations.remainingQty.toLocaleString()}
                        </p>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1">
                    <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Shipment Progress</span>
                        <span>{calculations.progressPercent.toFixed(1)}%</span>
                    </div>
                    <Progress
                        value={calculations.progressPercent}
                        className="h-2"
                    />
                </div>

                {/* Shipment History */}
                {shipments.length > 0 && (
                    <div className="space-y-2">
                        <p className="text-xs font-medium text-muted-foreground">Shipment History</p>
                        <div className="rounded-lg border border-border overflow-hidden">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-muted/30 hover:bg-muted/30">
                                        <TableHead className="text-xs">#</TableHead>
                                        <TableHead className="text-xs">Date/Time</TableHead>
                                        <TableHead className="text-xs text-right">Quantity</TableHead>
                                        <TableHead className="text-xs">Inspector</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {shipments.map((shipment, index) => (
                                        <TableRow key={shipment.id} className="border-border">
                                            <TableCell className="font-mono text-muted-foreground">
                                                {index + 1}
                                            </TableCell>
                                            <TableCell className="text-sm text-muted-foreground">
                                                {new Date(shipment.timestamp).toLocaleString()}
                                            </TableCell>
                                            <TableCell className="text-right font-mono font-semibold text-foreground">
                                                {shipment.quantity.toLocaleString()}
                                            </TableCell>
                                            <TableCell className="text-sm text-muted-foreground">
                                                {shipment.inspectedBy}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                )}

                {/* Add Shipment Button */}
                {!calculations.isComplete && (
                    <Button
                        onClick={() => setShowAddDialog(true)}
                        disabled={isDisabled}
                        className="w-full gap-2"
                    >
                        <Plus className="h-4 w-4" />
                        Record Partial Shipment
                    </Button>
                )}

                {calculations.isComplete && (
                    <div className="flex items-center gap-2 rounded-lg border border-success/30 bg-success/10 p-3">
                        <CheckCircle className="h-4 w-4 text-success shrink-0" />
                        <span className="text-xs font-medium text-success">
                            Order complete. All {totalQty.toLocaleString()} units have been shipped.
                        </span>
                    </div>
                )}
            </CardContent>

            {/* Add Shipment Dialog */}
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                <DialogContent className="bg-card border-border">
                    <DialogHeader>
                        <DialogTitle>Record Partial Shipment</DialogTitle>
                        <DialogDescription>
                            Enter the quantity for this partial shipment.
                            Maximum: {calculations.remainingQty.toLocaleString()} units
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4 space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Quantity to Ship</label>
                            <Input
                                type="number"
                                value={inputQty}
                                onChange={(e) => handleInputChange(e.target.value)}
                                placeholder={`Max: ${calculations.remainingQty}`}
                                className={cn(
                                    "font-mono text-lg h-12",
                                    inputError && "border-destructive"
                                )}
                                max={calculations.remainingQty}
                                min={1}
                            />
                            {inputError && (
                                <div className="flex items-center gap-1 text-xs text-destructive">
                                    <AlertCircle className="h-3 w-3" />
                                    {inputError}
                                </div>
                            )}
                        </div>

                        {/* Preview */}
                        {inputQty && !inputError && (
                            <div className="rounded-lg border border-border bg-muted/30 p-3 space-y-1">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">This shipment:</span>
                                    <span className="font-mono font-semibold">{parseInt(inputQty, 10).toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">After shipment:</span>
                                    <span className="font-mono text-amber-600">
                                        {(calculations.remainingQty - parseInt(inputQty, 10)).toLocaleString()} remaining
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => {
                            setShowAddDialog(false)
                            setInputQty("")
                            setInputError(null)
                        }}>
                            Cancel
                        </Button>
                        <Button onClick={handleAddShipment} disabled={!!inputError || !inputQty}>
                            Record Shipment
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </Card>
    )
}

// ==========================================
// HOOK FOR MANAGING PARTIAL SHIPMENTS
// ==========================================

export function usePartialShipments(orderId: string) {
    const [shipments, setShipments] = useState<PartialShipment[]>([])

    const addShipment = useCallback((shipment: PartialShipment) => {
        setShipments(prev => [...prev, shipment])
    }, [])

    const clearShipments = useCallback(() => {
        setShipments([])
    }, [])

    const totalShipped = useMemo(() => {
        return shipments.reduce((sum, s) => sum + s.quantity, 0)
    }, [shipments])

    return {
        shipments,
        addShipment,
        clearShipments,
        totalShipped,
    }
}
