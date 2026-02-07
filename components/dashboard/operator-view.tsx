"use client"

import { useState } from "react"
import { Package, Trash2, AlertTriangle, Save, Lock } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
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
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { DEFECT_CODES, type InspectionSpec } from "@/lib/data"

interface OperatorViewProps {
  finishQty: number
  setFinishQty: (v: number) => void
  scrapQty: number
  setScrapQty: (v: number) => void
  selectedDefect: string
  setSelectedDefect: (v: string) => void
  inspectionSpecs: InspectionSpec[]
}

export function OperatorView({
  finishQty,
  setFinishQty,
  scrapQty,
  setScrapQty,
  selectedDefect,
  setSelectedDefect,
  inspectionSpecs,
}: OperatorViewProps) {
  const [saved, setSaved] = useState(false)

  function handleSave() {
    if (finishQty <= 0) {
      toast.error("Finish Qty must be greater than 0")
      return
    }
    setSaved(true)
    toast.success("Production data saved successfully", {
      description: `Finish: ${finishQty} | Scrap: ${scrapQty} | Defect: ${selectedDefect || "None"}`,
    })
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {/* Production Output */}
      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Package className="h-4 w-4 text-primary" />
            Production Output
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="finish-qty" className="text-xs text-muted-foreground">
                Finish Qty
              </Label>
              <Input
                id="finish-qty"
                type="number"
                value={finishQty || ""}
                onChange={(e) => setFinishQty(Number(e.target.value))}
                placeholder="0"
                className="h-12 border-border bg-muted/30 text-lg font-mono text-foreground placeholder:text-muted-foreground"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="scrap-qty" className="text-xs text-muted-foreground">
                Scrap Qty
              </Label>
              <Input
                id="scrap-qty"
                type="number"
                value={scrapQty || ""}
                onChange={(e) => setScrapQty(Number(e.target.value))}
                placeholder="0"
                className="h-12 border-border bg-muted/30 text-lg font-mono text-foreground placeholder:text-muted-foreground"
              />
            </div>
          </div>

          {scrapQty > 0 && (
            <div className="flex items-center gap-2 rounded-lg border border-warning/30 bg-warning/10 p-3">
              <AlertTriangle className="h-4 w-4 text-warning" />
              <span className="text-xs text-warning">
                Scrap reported: {scrapQty} units ({((scrapQty / (finishQty + scrapQty)) * 100).toFixed(1)}% scrap rate)
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Defect Reporting */}
      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Trash2 className="h-4 w-4 text-destructive" />
            Defect Code
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="defect-code" className="text-xs text-muted-foreground">
              Select Defect (Z-Code)
            </Label>
            <Select value={selectedDefect} onValueChange={setSelectedDefect}>
              <SelectTrigger className="h-12 border-border bg-muted/30 text-foreground">
                <SelectValue placeholder="Select a defect code..." />
              </SelectTrigger>
              <SelectContent className="max-h-60 bg-card border-border">
                {DEFECT_CODES.map((d) => (
                  <SelectItem key={d.code} value={d.code} className="text-foreground">
                    <span className="font-mono text-primary">{d.code}</span>
                    <span className="ml-2 text-muted-foreground">{d.description}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedDefect && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3">
              <span className="text-xs font-medium text-destructive">
                Selected: {selectedDefect} - {DEFECT_CODES.find((d) => d.code === selectedDefect)?.description}
              </span>
            </div>
          )}

          <Button
            onClick={handleSave}
            className="h-12 w-full gap-2 bg-primary text-sm font-semibold text-primary-foreground hover:bg-primary/90"
          >
            <Save className="h-4 w-4" />
            Save Production Data
          </Button>

          {saved && (
            <p className="text-center text-xs text-success">Data saved at {new Date().toLocaleTimeString()}</p>
          )}
        </CardContent>
      </Card>

      {/* Dimensional Inspection - READ ONLY for operators */}
      <Card className="lg:col-span-2 border-border bg-card opacity-60">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Lock className="h-4 w-4 text-muted-foreground" />
            First Piece Inspection Report
            <Badge variant="secondary" className="ml-auto text-[10px] bg-secondary text-secondary-foreground">
              INSPECTOR ACCESS ONLY
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-lg border border-border">
            <Table>
              <TableHeader>
                <TableRow className="border-border bg-muted/30 hover:bg-muted/30">
                  <TableHead className="text-xs text-muted-foreground">Characteristic</TableHead>
                  <TableHead className="text-xs text-muted-foreground">Tool</TableHead>
                  <TableHead className="text-xs text-muted-foreground text-right">Min</TableHead>
                  <TableHead className="text-xs text-muted-foreground text-right">Max</TableHead>
                  <TableHead className="text-xs text-muted-foreground text-right">Actual</TableHead>
                  <TableHead className="text-xs text-muted-foreground text-center">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {inspectionSpecs.map((spec) => (
                  <TableRow key={spec.id} className="border-border hover:bg-transparent">
                    <TableCell className="font-medium text-foreground">{spec.characteristic}</TableCell>
                    <TableCell className="text-muted-foreground">{spec.tool}</TableCell>
                    <TableCell className="text-right font-mono text-muted-foreground">{spec.min}</TableCell>
                    <TableCell className="text-right font-mono text-muted-foreground">{spec.max}</TableCell>
                    <TableCell className="text-right">
                      <Input
                        disabled
                        value={spec.actual ?? ""}
                        className="h-8 w-20 ml-auto text-right font-mono bg-muted/20 border-border text-muted-foreground cursor-not-allowed"
                      />
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="secondary" className="text-[10px] bg-muted text-muted-foreground">
                        LOCKED
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
