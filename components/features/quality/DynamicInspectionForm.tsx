/**
 * @fileoverview Dynamic inspection form component.
 * Renders inspection inputs dynamically based on part configuration fields.
 * Implements Poka-Yoke validation with real-time feedback.
 * @module components/features/quality/DynamicInspectionForm
 */

"use client"

import React, { useState, useCallback, useMemo } from "react"
import { CheckCircle2, AlertTriangle, Info } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"
import type { FieldDefinition, InspectionValue } from "@/lib/data"

// ==========================================
// TYPES
// ==========================================

interface DynamicInspectionFormProps {
    /** Field definitions from part configuration */
    fields: FieldDefinition[]
    /** Current inspection values */
    values: InspectionValue[]
    /** Callback when values change */
    onValuesChange: (values: InspectionValue[]) => void
    /** Whether form is read-only */
    isReadOnly?: boolean
    /** Whether lot has been finalized */
    isLotFinalized?: boolean
}

// ==========================================
// STATUS BADGE
// ==========================================

function StatusBadge({ status }: { status: InspectionValue["status"] }) {
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

// ==========================================
// VALIDATION HELPERS
// ==========================================

function validateNumericField(
    value: number | null,
    min?: number,
    max?: number
): InspectionValue["status"] {
    if (value === null) return "pending"
    if (min !== undefined && value < min) return "fail"
    if (max !== undefined && value > max) return "fail"
    return "pass"
}

function validateBooleanField(value: boolean | null): InspectionValue["status"] {
    if (value === null) return "pending"
    return value ? "pass" : "fail"
}

function validateSelectField(
    value: string | null,
    required: boolean
): InspectionValue["status"] {
    if (required && (!value || value === "")) return "pending"
    return value ? "pass" : "pending"
}

// ==========================================
// MAIN COMPONENT
// ==========================================

export function DynamicInspectionForm({
    fields,
    values,
    onValuesChange,
    isReadOnly = false,
    isLotFinalized = false,
}: DynamicInspectionFormProps) {
    const inputDisabled = isReadOnly || isLotFinalized

    // Get value for a field
    const getValue = useCallback((fieldId: string): InspectionValue => {
        return values.find(v => v.fieldId === fieldId) || {
            fieldId,
            value: null,
            status: "pending",
        }
    }, [values])

    // Update value for a field
    const updateValue = useCallback((fieldId: string, newValue: number | boolean | string | null, field: FieldDefinition) => {
        let status: InspectionValue["status"] = "pending"

        switch (field.type) {
            case "numeric":
                status = validateNumericField(newValue as number | null, field.min, field.max)
                break
            case "boolean":
                status = validateBooleanField(newValue as boolean | null)
                break
            case "select":
                status = validateSelectField(newValue as string | null, field.required)
                break
        }

        const newValues = values.filter(v => v.fieldId !== fieldId)
        newValues.push({ fieldId, value: newValue, status })
        onValuesChange(newValues)
    }, [values, onValuesChange])

    // Render input based on field type
    const renderInput = (field: FieldDefinition) => {
        const inspValue = getValue(field.id)
        const value = inspValue.value
        const status = inspValue.status

        switch (field.type) {
            case "numeric":
                return (
                    <Input
                        type="number"
                        step="0.01"
                        value={value !== null ? String(value) : ""}
                        onChange={(e) => {
                            const num = e.target.value === "" ? null : parseFloat(e.target.value)
                            updateValue(field.id, num, field)
                        }}
                        disabled={inputDisabled}
                        placeholder="Enter..."
                        className={cn(
                            "h-10 w-28 text-right font-mono border-border bg-muted/30 text-foreground placeholder:text-muted-foreground/50",
                            status === "fail" && "border-destructive bg-destructive/10 text-destructive border-2",
                            status === "pass" && "border-success bg-success/10 text-success border-2"
                        )}
                    />
                )

            case "boolean":
                return (
                    <div className="flex items-center gap-2">
                        <Switch
                            checked={value === true}
                            onCheckedChange={(checked) => updateValue(field.id, checked, field)}
                            disabled={inputDisabled}
                            className={cn(
                                status === "fail" && "data-[state=unchecked]:bg-destructive/30",
                                status === "pass" && "data-[state=checked]:bg-success"
                            )}
                        />
                        <Label className={cn(
                            "text-sm",
                            status === "pass" && "text-success font-semibold",
                            status === "fail" && "text-destructive font-semibold"
                        )}>
                            {value === true ? "OK" : value === false ? "NG" : "---"}
                        </Label>
                    </div>
                )

            case "select":
                return (
                    <Select
                        value={value as string | undefined}
                        onValueChange={(v) => updateValue(field.id, v, field)}
                        disabled={inputDisabled}
                    >
                        <SelectTrigger className={cn(
                            "w-36 h-10",
                            status === "pass" && "border-success bg-success/10 text-success border-2"
                        )}>
                            <SelectValue placeholder="Select..." />
                        </SelectTrigger>
                        <SelectContent>
                            {field.options?.map((option) => (
                                <SelectItem key={option} value={option}>
                                    {option}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                )

            default:
                return null
        }
    }

    // Summary stats
    const stats = useMemo(() => {
        const total = fields.length
        const completed = values.filter(v => v.status !== "pending").length
        const passed = values.filter(v => v.status === "pass").length
        const failed = values.filter(v => v.status === "fail").length
        return { total, completed, passed, failed }
    }, [fields, values])

    if (fields.length === 0) {
        return (
            <div className="rounded-lg border border-dashed border-border p-6 text-center">
                <Info className="mx-auto h-8 w-8 text-muted-foreground/50 mb-2" />
                <p className="text-sm text-muted-foreground">
                    No inspection fields defined for this part.
                </p>
            </div>
        )
    }

    return (
        <div className="space-y-3">
            {/* Summary Badges */}
            <div className="flex items-center gap-2">
                {stats.passed > 0 && (
                    <Badge className="bg-success/20 text-success border-0 text-[10px]">
                        {stats.passed} PASS
                    </Badge>
                )}
                {stats.failed > 0 && (
                    <Badge className="bg-destructive/20 text-destructive border-0 text-[10px]">
                        {stats.failed} FAIL
                    </Badge>
                )}
                <Badge variant="outline" className="text-[10px]">
                    {stats.completed}/{stats.total} Inspected
                </Badge>
            </div>

            {/* Inspection Table */}
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
                        {fields.map((field, index) => {
                            const inspValue = getValue(field.id)
                            return (
                                <TableRow
                                    key={field.id}
                                    className={cn(
                                        "border-border transition-colors",
                                        inspValue.status === "fail" && "bg-destructive/5",
                                        inspValue.status === "pass" && "bg-success/5"
                                    )}
                                >
                                    <TableCell className="font-mono text-muted-foreground">
                                        {index + 1}
                                    </TableCell>
                                    <TableCell className="font-medium text-foreground">
                                        {field.name}
                                        {field.required && (
                                            <span className="text-destructive ml-1">*</span>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">
                                        {field.tool || "---"}
                                    </TableCell>
                                    <TableCell className="text-right font-mono text-muted-foreground">
                                        {field.type === "numeric" && field.min !== undefined
                                            ? field.min.toFixed(2)
                                            : "---"}
                                    </TableCell>
                                    <TableCell className="text-right font-mono text-muted-foreground">
                                        {field.type === "numeric" && field.max !== undefined
                                            ? field.max.toFixed(2)
                                            : "---"}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {renderInput(field)}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <StatusBadge status={inspValue.status} />
                                    </TableCell>
                                </TableRow>
                            )
                        })}
                    </TableBody>
                </Table>
            </div>

            {/* Failure Alert */}
            {stats.failed > 0 && (
                <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3">
                    <AlertTriangle className="h-4 w-4 text-destructive shrink-0" />
                    <span className="text-xs font-medium text-destructive">
                        OUT OF TOLERANCE detected. {stats.failed} reading(s) outside specification. Release is BLOCKED.
                    </span>
                </div>
            )}

            {/* All Pass Alert */}
            {stats.completed === stats.total && stats.failed === 0 && stats.total > 0 && (
                <div className="flex items-center gap-2 rounded-lg border border-success/30 bg-success/10 p-3">
                    <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
                    <span className="text-xs font-medium text-success">
                        All characteristics within tolerance. Lot is eligible for release.
                    </span>
                </div>
            )}
        </div>
    )
}

// ==========================================
// HOOK FOR MANAGING INSPECTION STATE
// ==========================================

export function useDynamicInspection(fields: FieldDefinition[]) {
    const [values, setValues] = useState<InspectionValue[]>([])

    const updateValues = useCallback((newValues: InspectionValue[]) => {
        setValues(newValues)
    }, [])

    const reset = useCallback(() => {
        setValues([])
    }, [])

    const stats = useMemo(() => {
        const total = fields.length
        const completed = values.filter(v => v.status !== "pending").length
        const passed = values.filter(v => v.status === "pass").length
        const failed = values.filter(v => v.status === "fail").length
        const allInspected = completed === total
        const allPass = allInspected && failed === 0 && total > 0
        const hasFailures = failed > 0
        return { total, completed, passed, failed, allInspected, allPass, hasFailures }
    }, [fields, values])

    return {
        values,
        updateValues,
        reset,
        stats,
    }
}
