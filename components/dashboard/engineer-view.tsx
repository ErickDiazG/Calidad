/**
 * @fileoverview Engineering Manager dashboard view.
 * Provides UI for Part Configuration, Versioning, and Blueprint Management.
 * @module components/dashboard/engineer-view
 */

"use client"

import React, { useState, useCallback } from "react"
import {
    Settings2,
    Plus,
    Pencil,
    Trash2,
    History,
    FileImage,
    ChevronRight,
    Search,
    Save,
    X,
    AlertTriangle,
    CheckCircle,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
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
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { usePartConfig } from "@/context/PartConfigContext"
import type { PartConfig, FieldDefinition, FieldType } from "@/lib/data"

// ==========================================
// FIELD EDITOR COMPONENT
// ==========================================

interface FieldEditorProps {
    field: FieldDefinition
    onUpdate: (updates: Partial<FieldDefinition>) => void
    onRemove: () => void
    index: number
}

function FieldEditor({ field, onUpdate, onRemove, index }: FieldEditorProps) {
    return (
        <div className="flex items-start gap-3 rounded-lg border border-border bg-muted/20 p-3">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-primary/10 text-xs font-bold text-primary">
                {index + 1}
            </div>
            <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                    <Label className="text-xs text-muted-foreground">Field Name</Label>
                    <Input
                        value={field.name}
                        onChange={(e) => onUpdate({ name: e.target.value })}
                        className="h-8 text-sm"
                        placeholder="e.g., Radius"
                    />
                </div>
                <div>
                    <Label className="text-xs text-muted-foreground">Type</Label>
                    <Select
                        value={field.type}
                        onValueChange={(value: FieldType) => onUpdate({ type: value })}
                    >
                        <SelectTrigger className="h-8 text-sm">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="numeric">Numeric</SelectItem>
                            <SelectItem value="boolean">Visual Check</SelectItem>
                            <SelectItem value="select">Select Options</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                {field.type === "numeric" && (
                    <>
                        <div>
                            <Label className="text-xs text-muted-foreground">Min</Label>
                            <Input
                                type="number"
                                step="0.001"
                                value={field.min ?? ""}
                                onChange={(e) => onUpdate({ min: e.target.value ? parseFloat(e.target.value) : undefined })}
                                className="h-8 text-sm font-mono"
                                placeholder="0.00"
                            />
                        </div>
                        <div>
                            <Label className="text-xs text-muted-foreground">Max</Label>
                            <Input
                                type="number"
                                step="0.001"
                                value={field.max ?? ""}
                                onChange={(e) => onUpdate({ max: e.target.value ? parseFloat(e.target.value) : undefined })}
                                className="h-8 text-sm font-mono"
                                placeholder="0.00"
                            />
                        </div>
                    </>
                )}
                {field.type === "select" && (
                    <div className="col-span-2">
                        <Label className="text-xs text-muted-foreground">Options (comma-separated)</Label>
                        <Input
                            value={field.options?.join(", ") ?? ""}
                            onChange={(e) => onUpdate({ options: e.target.value.split(",").map(s => s.trim()).filter(Boolean) })}
                            className="h-8 text-sm"
                            placeholder="Option 1, Option 2, Option 3"
                        />
                    </div>
                )}
                <div>
                    <Label className="text-xs text-muted-foreground">Tool</Label>
                    <Input
                        value={field.tool ?? ""}
                        onChange={(e) => onUpdate({ tool: e.target.value || undefined })}
                        className="h-8 text-sm"
                        placeholder="e.g., Vernier"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <Switch
                        id={`required-${field.id}`}
                        checked={field.required}
                        onCheckedChange={(checked) => onUpdate({ required: checked })}
                    />
                    <Label htmlFor={`required-${field.id}`} className="text-xs">Required</Label>
                </div>
            </div>
            <Button
                variant="ghost"
                size="icon"
                onClick={onRemove}
                className="h-8 w-8 shrink-0 text-destructive hover:text-destructive hover:bg-destructive/10"
            >
                <Trash2 className="h-4 w-4" />
            </Button>
        </div>
    )
}

// ==========================================
// MAIN COMPONENT
// ==========================================

export function EngineerView() {
    const { parts, revisions, createPart, updatePart, deletePart, createRevision, getRevisionsByPart } = usePartConfig()

    const [searchQuery, setSearchQuery] = useState("")
    const [selectedPart, setSelectedPart] = useState<PartConfig | null>(null)
    const [showCreateDialog, setShowCreateDialog] = useState(false)
    const [showDeleteDialog, setShowDeleteDialog] = useState<PartConfig | null>(null)
    const [showRevisionDialog, setShowRevisionDialog] = useState(false)
    const [showHistoryDialog, setShowHistoryDialog] = useState(false)
    const [revisionNote, setRevisionNote] = useState("")

    // Form state for create/edit
    const [formData, setFormData] = useState<{
        partNumber: string
        name: string
        fields: FieldDefinition[]
    }>({
        partNumber: "",
        name: "",
        fields: [],
    })

    // Filter parts by search
    const filteredParts = parts.filter(part =>
        part.partNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        part.name.toLowerCase().includes(searchQuery.toLowerCase())
    )

    // Generate unique field ID
    const generateFieldId = () => `field-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 5)}`

    // Handle create new part
    const handleCreatePart = useCallback(() => {
        if (!formData.partNumber.trim() || !formData.name.trim()) {
            toast.error("Part Number and Name are required")
            return
        }
        if (formData.fields.length === 0) {
            toast.error("At least one field is required")
            return
        }

        createPart({
            partNumber: formData.partNumber.trim(),
            name: formData.name.trim(),
            currentRevision: "Rev A",
            fields: formData.fields,
        })

        toast.success("Part Created", {
            description: `${formData.partNumber} has been added successfully.`,
        })

        setShowCreateDialog(false)
        setFormData({ partNumber: "", name: "", fields: [] })
    }, [formData, createPart])

    // Handle save part changes
    const handleSavePart = useCallback(() => {
        if (!selectedPart) return

        updatePart(selectedPart.id, {
            partNumber: formData.partNumber,
            name: formData.name,
            fields: formData.fields,
        })

        toast.success("Changes Saved", {
            description: `${formData.partNumber} has been updated.`,
        })
    }, [selectedPart, formData, updatePart])

    // Handle create revision
    const handleCreateRevision = useCallback(() => {
        if (!selectedPart || !revisionNote.trim()) {
            toast.error("Change note is required")
            return
        }

        // First save current changes
        updatePart(selectedPart.id, {
            partNumber: formData.partNumber,
            name: formData.name,
            fields: formData.fields,
        })

        const newRev = createRevision(selectedPart.id, revisionNote.trim(), "Ing. Sistema")

        toast.success("New Revision Created", {
            description: `${formData.partNumber} is now at ${newRev.revision}`,
        })

        // Update selected part with new revision
        setSelectedPart(prev => prev ? { ...prev, currentRevision: newRev.revision } : null)
        setShowRevisionDialog(false)
        setRevisionNote("")
    }, [selectedPart, formData, revisionNote, updatePart, createRevision])

    // Handle delete part
    const handleDeletePart = useCallback(() => {
        if (!showDeleteDialog) return

        deletePart(showDeleteDialog.id)

        toast.success("Part Deleted", {
            description: `${showDeleteDialog.partNumber} has been removed.`,
        })

        if (selectedPart?.id === showDeleteDialog.id) {
            setSelectedPart(null)
        }
        setShowDeleteDialog(null)
    }, [showDeleteDialog, deletePart, selectedPart])

    // Select a part for editing
    const handleSelectPart = (part: PartConfig) => {
        setSelectedPart(part)
        setFormData({
            partNumber: part.partNumber,
            name: part.name,
            fields: [...part.fields],
        })
    }

    // Add new field to form
    const addField = () => {
        const newField: FieldDefinition = {
            id: generateFieldId(),
            name: "",
            type: "numeric",
            required: true,
        }
        setFormData(prev => ({
            ...prev,
            fields: [...prev.fields, newField],
        }))
    }

    // Update field in form
    const updateFormField = (fieldId: string, updates: Partial<FieldDefinition>) => {
        setFormData(prev => ({
            ...prev,
            fields: prev.fields.map(f => f.id === fieldId ? { ...f, ...updates } : f),
        }))
    }

    // Remove field from form
    const removeFormField = (fieldId: string) => {
        setFormData(prev => ({
            ...prev,
            fields: prev.fields.filter(f => f.id !== fieldId),
        }))
    }

    // Get revision history for selected part
    const partRevisions = selectedPart ? getRevisionsByPart(selectedPart.id) : []

    return (
        <div className="space-y-4">
            {/* Header */}
            <Card className="border-border bg-card">
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Settings2 className="h-5 w-5 text-primary" />
                            <CardTitle className="text-lg">Part Configuration Management</CardTitle>
                        </div>
                        <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/30">
                            ADMIN_ENGINEER
                        </Badge>
                    </div>
                    <CardDescription>
                        Create and manage part models with dynamic inspection fields
                    </CardDescription>
                </CardHeader>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Parts List */}
                <Card className="border-border bg-card lg:col-span-1">
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-sm font-semibold">Part Models</CardTitle>
                            <Button
                                size="sm"
                                onClick={() => {
                                    setFormData({ partNumber: "", name: "", fields: [] })
                                    setShowCreateDialog(true)
                                }}
                                className="h-8 gap-1"
                            >
                                <Plus className="h-3 w-3" />
                                New Part
                            </Button>
                        </div>
                        <div className="relative mt-2">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search parts..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-8 h-9"
                            />
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <ScrollArea className="h-[400px]">
                            <div className="space-y-1 p-2">
                                {filteredParts.length === 0 ? (
                                    <p className="text-center text-sm text-muted-foreground py-8">
                                        No parts found
                                    </p>
                                ) : (
                                    filteredParts.map((part) => (
                                        <button
                                            key={part.id}
                                            onClick={() => handleSelectPart(part)}
                                            className={cn(
                                                "w-full flex items-center gap-3 rounded-lg p-3 text-left transition-colors hover:bg-muted/50",
                                                selectedPart?.id === part.id && "bg-primary/10 border border-primary/30"
                                            )}
                                        >
                                            <div className="flex-1 min-w-0">
                                                <p className="font-mono font-semibold text-sm text-foreground truncate">
                                                    {part.partNumber}
                                                </p>
                                                <p className="text-xs text-muted-foreground truncate">
                                                    {part.name}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Badge variant="secondary" className="text-[10px]">
                                                    {part.currentRevision}
                                                </Badge>
                                                <Badge variant="outline" className="text-[10px]">
                                                    {part.fields.length} fields
                                                </Badge>
                                            </div>
                                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                        </button>
                                    ))
                                )}
                            </div>
                        </ScrollArea>
                    </CardContent>
                </Card>

                {/* Part Editor */}
                <Card className="border-border bg-card lg:col-span-2">
                    {selectedPart ? (
                        <>
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="text-sm font-semibold flex items-center gap-2">
                                            <Pencil className="h-4 w-4 text-primary" />
                                            Edit Part: {formData.partNumber}
                                        </CardTitle>
                                        <CardDescription>
                                            Modify fields and specifications for this part
                                        </CardDescription>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setShowHistoryDialog(true)}
                                            className="h-8 gap-1"
                                        >
                                            <History className="h-3 w-3" />
                                            History
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setShowDeleteDialog(selectedPart)}
                                            className="h-8 gap-1 text-destructive hover:text-destructive"
                                        >
                                            <Trash2 className="h-3 w-3" />
                                            Delete
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <Tabs defaultValue="fields" className="w-full">
                                    <TabsList className="grid w-full grid-cols-2 mb-4">
                                        <TabsTrigger value="fields">Fields & Specs</TabsTrigger>
                                        <TabsTrigger value="blueprints">Blueprints</TabsTrigger>
                                    </TabsList>

                                    <TabsContent value="fields" className="space-y-4">
                                        {/* Basic Info */}
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <Label>Part Number</Label>
                                                <Input
                                                    value={formData.partNumber}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, partNumber: e.target.value }))}
                                                    className="font-mono"
                                                />
                                            </div>
                                            <div>
                                                <Label>Part Name</Label>
                                                <Input
                                                    value={formData.name}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                                />
                                            </div>
                                        </div>

                                        {/* Fields */}
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <Label>Inspection Fields</Label>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={addField}
                                                    className="h-7 gap-1 text-xs"
                                                >
                                                    <Plus className="h-3 w-3" />
                                                    Add Field
                                                </Button>
                                            </div>
                                            <div className="space-y-2">
                                                {formData.fields.length === 0 ? (
                                                    <div className="rounded-lg border border-dashed border-border p-6 text-center">
                                                        <p className="text-sm text-muted-foreground">
                                                            No fields defined. Click "Add Field" to create inspection points.
                                                        </p>
                                                    </div>
                                                ) : (
                                                    formData.fields.map((field, index) => (
                                                        <FieldEditor
                                                            key={field.id}
                                                            field={field}
                                                            index={index}
                                                            onUpdate={(updates) => updateFormField(field.id, updates)}
                                                            onRemove={() => removeFormField(field.id)}
                                                        />
                                                    ))
                                                )}
                                            </div>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex items-center gap-2 pt-4 border-t border-border">
                                            <Button
                                                onClick={handleSavePart}
                                                className="gap-1"
                                            >
                                                <Save className="h-4 w-4" />
                                                Save Changes
                                            </Button>
                                            <Button
                                                variant="secondary"
                                                onClick={() => setShowRevisionDialog(true)}
                                                className="gap-1"
                                            >
                                                <History className="h-4 w-4" />
                                                Save as New Revision
                                            </Button>
                                        </div>
                                    </TabsContent>

                                    <TabsContent value="blueprints" className="space-y-4">
                                        <div className="rounded-lg border border-dashed border-border p-8 text-center">
                                            <FileImage className="mx-auto h-12 w-12 text-muted-foreground/50 mb-2" />
                                            <p className="text-sm font-medium text-foreground mb-1">
                                                Upload Blueprint or Reference Photos
                                            </p>
                                            <p className="text-xs text-muted-foreground mb-4">
                                                Drag and drop PDF drawings or images here
                                            </p>
                                            <Button variant="outline" size="sm">
                                                Browse Files
                                            </Button>
                                        </div>
                                        {selectedPart.blueprintUrl && (
                                            <div className="rounded-lg border border-border p-3">
                                                <p className="text-sm font-medium">Current Blueprint</p>
                                                <p className="text-xs text-muted-foreground">{selectedPart.blueprintUrl}</p>
                                            </div>
                                        )}
                                    </TabsContent>
                                </Tabs>
                            </CardContent>
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-[500px] text-center">
                            <Settings2 className="h-16 w-16 text-muted-foreground/30 mb-4" />
                            <p className="text-lg font-medium text-foreground">Select a Part to Edit</p>
                            <p className="text-sm text-muted-foreground">
                                Choose a part from the list or create a new one
                            </p>
                        </div>
                    )}
                </Card>
            </div>

            {/* Create Part Dialog */}
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                <DialogContent className="bg-card border-border max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Create New Part Model</DialogTitle>
                        <DialogDescription>
                            Define a new part with custom inspection fields
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>Part Number *</Label>
                                <Input
                                    value={formData.partNumber}
                                    onChange={(e) => setFormData(prev => ({ ...prev, partNumber: e.target.value }))}
                                    placeholder="e.g., 320-52761"
                                    className="font-mono"
                                />
                            </div>
                            <div>
                                <Label>Part Name *</Label>
                                <Input
                                    value={formData.name}
                                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                    placeholder="e.g., Bushing Assembly"
                                />
                            </div>
                        </div>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <Label>Inspection Fields *</Label>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={addField}
                                    className="h-7 gap-1 text-xs"
                                >
                                    <Plus className="h-3 w-3" />
                                    Add Field
                                </Button>
                            </div>
                            <div className="space-y-2 max-h-[300px] overflow-y-auto">
                                {formData.fields.map((field, index) => (
                                    <FieldEditor
                                        key={field.id}
                                        field={field}
                                        index={index}
                                        onUpdate={(updates) => updateFormField(field.id, updates)}
                                        onRemove={() => removeFormField(field.id)}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleCreatePart}>
                            Create Part
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={showDeleteDialog !== null} onOpenChange={() => setShowDeleteDialog(null)}>
                <DialogContent className="bg-card border-border">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-destructive">
                            <AlertTriangle className="h-5 w-5" />
                            Delete Part
                        </DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete <strong>{showDeleteDialog?.partNumber}</strong>?
                            This will also delete all revision history. This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowDeleteDialog(null)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleDeletePart}>
                            Delete Part
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* New Revision Dialog */}
            <Dialog open={showRevisionDialog} onOpenChange={setShowRevisionDialog}>
                <DialogContent className="bg-card border-border">
                    <DialogHeader>
                        <DialogTitle>Create New Revision</DialogTitle>
                        <DialogDescription>
                            Save current changes as a new revision. Current revision: {selectedPart?.currentRevision}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <Label>Change Note *</Label>
                        <Textarea
                            value={revisionNote}
                            onChange={(e) => setRevisionNote(e.target.value)}
                            placeholder="Describe what changed in this revision (e.g., Increased tolerance per ECO-2026-015)"
                            rows={3}
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowRevisionDialog(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleCreateRevision}>
                            Create Revision
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Revision History Dialog */}
            <Dialog open={showHistoryDialog} onOpenChange={setShowHistoryDialog}>
                <DialogContent className="bg-card border-border max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Revision History</DialogTitle>
                        <DialogDescription>
                            {selectedPart?.partNumber} - All revisions
                        </DialogDescription>
                    </DialogHeader>
                    <ScrollArea className="max-h-[400px]">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Revision</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Created By</TableHead>
                                    <TableHead>Change Note</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {partRevisions.map((rev) => (
                                    <TableRow key={rev.id}>
                                        <TableCell>
                                            <Badge variant={rev.revision === selectedPart?.currentRevision ? "default" : "secondary"}>
                                                {rev.revision}
                                                {rev.revision === selectedPart?.currentRevision && " (Active)"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-sm text-muted-foreground">
                                            {new Date(rev.createdAt).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell className="text-sm">{rev.createdBy}</TableCell>
                                        <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">
                                            {rev.changeNote}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </ScrollArea>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowHistoryDialog(false)}>
                            Close
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
