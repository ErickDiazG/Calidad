/**
 * @fileoverview Modular inspection table component for dimensional quality checks.
 * Displays specification data with real-time PASS/FAIL validation.
 * @module components/features/quality/InspectionTable
 */

"use client"

import { CheckCircle2, AlertTriangle } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"
import type { InspectionSpec } from "@/lib/data"

/**
 * Props for the InspectionTable component
 * @interface InspectionTableProps
 */
interface InspectionTableProps {
    /** Array of inspection specifications */
    specs: InspectionSpec[]
    /** Callback when an actual value is updated */
    onUpdateSpec?: (id: number, actual: number | null) => void
    /** Whether the table is in read-only mode (RBAC enforcement) */
    isReadOnly?: boolean
    /** Whether the lot has been finalized (released/rejected) */
    isLotFinalized?: boolean
}

/**
 * Renders the status badge for a specification
 * @param {InspectionSpec["status"]} status - The current status
 * @returns {JSX.Element} The status indicator
 */
function StatusBadge({ status }: { status: InspectionSpec["status"] }) {
    if (status === "pending") {
        return (
            <Badge variant="secondary" className="text-[10px] bg-muted text-muted-foreground">
                PENDING
            </Badge>
        )
    }

    if (status === "pass") {
        return (
            <div className="flex items-center justify-center gap-1">
                <CheckCircle2 className="h-4 w-4 text-success" />
                <span className="text-xs font-semibold text-success">PASS</span>
            </div>
        )
    }

    return (
        <div className="flex items-center justify-center gap-1">
            <AlertTriangle className="h-4 w-4 text-destructive" />
            <span className="text-xs font-semibold text-destructive">FAIL</span>
        </div>
    )
}

/**
 * Modular inspection table component for displaying and editing dimensional specifications.
 * Supports real-time validation with instant PASS/FAIL feedback.
 * Enforces RBAC through the isReadOnly prop.
 * 
 * @param {InspectionTableProps} props - Component props
 * @returns {JSX.Element} The inspection table
 * @example
 * // Editable mode for inspectors
 * <InspectionTable specs={specs} onUpdateSpec={handleUpdate} isReadOnly={false} />
 * 
 * // Read-only mode for operators
 * <InspectionTable specs={specs} isReadOnly={true} />
 */
export function InspectionTable({
    specs,
    onUpdateSpec,
    isReadOnly = false,
    isLotFinalized = false,
}: InspectionTableProps) {
    /**
     * Handles input change and parses the value
     * @param {number} id - Spec ID
     * @param {string} value - Input value
     */
    function handleActualChange(id: number, value: string) {
        if (!onUpdateSpec) return
        const num = value === "" ? null : Number.parseFloat(value)
        onUpdateSpec(id, num)
    }

    const inputDisabled = isReadOnly || isLotFinalized

    return (
        <div className="overflow-x-auto rounded-lg border border-border">
            <Table>
                <TableHeader>
                    <TableRow className="border-border bg-muted/30 hover:bg-muted/30">
                        <TableHead className="text-xs text-muted-foreground w-12">#</TableHead>
                        <TableHead className="text-xs text-muted-foreground">Characteristic</TableHead>
                        <TableHead className="text-xs text-muted-foreground">Tool</TableHead>
                        <TableHead className="text-xs text-muted-foreground text-right">Min</TableHead>
                        <TableHead className="text-xs text-muted-foreground text-right">Max</TableHead>
                        <TableHead className="text-xs text-muted-foreground text-right">
                            Actual Reading
                        </TableHead>
                        <TableHead className="text-xs text-muted-foreground text-center w-24">
                            Status
                        </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {specs.map((spec) => (
                        <TableRow
                            key={spec.id}
                            className={cn(
                                "border-border transition-colors",
                                spec.status === "fail" && "bg-destructive/5",
                                spec.status === "pass" && "bg-success/5"
                            )}
                        >
                            <TableCell className="font-mono text-muted-foreground">{spec.id}</TableCell>
                            <TableCell className="font-medium text-foreground">{spec.characteristic}</TableCell>
                            <TableCell className="text-muted-foreground">{spec.tool}</TableCell>
                            <TableCell className="text-right font-mono text-muted-foreground">
                                {spec.min.toFixed(2)}
                            </TableCell>
                            <TableCell className="text-right font-mono text-muted-foreground">
                                {spec.max.toFixed(2)}
                            </TableCell>
                            <TableCell className="text-right">
                                {inputDisabled ? (
                                    <span
                                        className={cn(
                                            "inline-block w-24 text-right font-mono py-2",
                                            spec.status === "fail" && "text-destructive font-semibold",
                                            spec.status === "pass" && "text-success font-semibold",
                                            spec.status === "pending" && "text-muted-foreground"
                                        )}
                                    >
                                        {spec.actual !== null ? spec.actual.toFixed(2) : "---"}
                                    </span>
                                ) : (
                                    <Input
                                        type="number"
                                        step="0.01"
                                        value={spec.actual ?? ""}
                                        onChange={(e) => handleActualChange(spec.id, e.target.value)}
                                        placeholder="Enter..."
                                        className={cn(
                                            "h-10 w-24 ml-auto text-right font-mono border-border bg-muted/30 text-foreground placeholder:text-muted-foreground/50",
                                            spec.status === "fail" && "border-destructive bg-destructive/10 text-destructive",
                                            spec.status === "pass" && "border-success bg-success/10 text-success"
                                        )}
                                    />
                                )}
                            </TableCell>
                            <TableCell className="text-center">
                                <StatusBadge status={spec.status} />
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}
