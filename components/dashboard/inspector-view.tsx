"use client"

import {
  ClipboardCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ShieldCheck,
  ShieldX,
  Eye,
  FileDown,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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
import type { InspectionSpec } from "@/lib/data"
import { useState } from "react"
import { generateCertificatePDF, DEMO_CERTIFICATE_DATA } from "@/lib/pdf/CertificatePDFGenerator"

interface InspectorViewProps {
  finishQty: number
  scrapQty: number
  selectedDefect: string
  inspectionSpecs: InspectionSpec[]
  onUpdateSpec: (id: number, actual: number | null) => void
  lotReleased: boolean
  setLotReleased: (v: boolean) => void
  lotRejected: boolean
  setLotRejected: (v: boolean) => void
  /** If true, inspection inputs are read-only (RBAC enforcement) */
  isReadOnly?: boolean
}

export function InspectorView({
  finishQty,
  scrapQty,
  selectedDefect,
  inspectionSpecs,
  onUpdateSpec,
  lotReleased,
  setLotReleased,
  lotRejected,
  setLotRejected,
  isReadOnly = false,
}: InspectorViewProps) {
  const [confirmDialog, setConfirmDialog] = useState<"approve" | "reject" | null>(null)

  const hasFailures = inspectionSpecs.some((s) => s.status === "fail")
  const allInspected = inspectionSpecs.every((s) => s.actual !== null)
  const allPass = allInspected && !hasFailures
  const passCount = inspectionSpecs.filter((s) => s.status === "pass").length
  const failCount = inspectionSpecs.filter((s) => s.status === "fail").length

  function handleActualChange(id: number, value: string) {
    const num = value === "" ? null : Number.parseFloat(value)
    onUpdateSpec(id, num)
  }

  function handleApprove() {
    if (hasFailures) {
      toast.error("Cannot approve: there are out-of-tolerance readings", {
        description: "All dimensional inspections must pass before release.",
      })
      setConfirmDialog(null)
      return
    }
    if (!allInspected) {
      toast.error("Cannot approve: not all characteristics inspected", {
        description: "Please enter actual readings for all characteristics.",
      })
      setConfirmDialog(null)
      return
    }

    // Generate Certificate of Conformance PDF
    try {
      generateCertificatePDF(DEMO_CERTIFICATE_DATA)
      toast.success("Lot #296039 APPROVED for release", {
        description: "Certificate of Conformance generated and downloaded.",
        icon: <FileDown className="h-4 w-4" />,
      })
    } catch (error) {
      toast.error("Error generating certificate", {
        description: "Please try again or contact support.",
      })
    }

    setLotReleased(true)
    setConfirmDialog(null)
  }

  function handleReject() {
    setLotRejected(true)
    setConfirmDialog(null)
    toast.error("Lot #296039 REJECTED", {
      description: "Non-conformance report will be generated.",
    })
  }

  return (
    <div className="space-y-4">
      {/* Operator Summary - read only */}
      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Eye className="h-4 w-4 text-primary" />
            Production Data (Operator Submitted)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="rounded-lg border border-border bg-muted/30 p-3 text-center">
              <p className="text-xs text-muted-foreground">Finish Qty</p>
              <p className="text-2xl font-bold font-mono text-foreground">{finishQty || "---"}</p>
            </div>
            <div className="rounded-lg border border-border bg-muted/30 p-3 text-center">
              <p className="text-xs text-muted-foreground">Scrap Qty</p>
              <p className="text-2xl font-bold font-mono text-foreground">{scrapQty || "---"}</p>
            </div>
            <div className="rounded-lg border border-border bg-muted/30 p-3 text-center">
              <p className="text-xs text-muted-foreground">Defect Code</p>
              <p className="text-2xl font-bold font-mono text-foreground">{selectedDefect || "---"}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dimensional Inspection Table */}
      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <ClipboardCheck className="h-4 w-4 text-primary" />
              First Piece Inspection Report
            </CardTitle>
            <div className="flex items-center gap-2">
              {passCount > 0 && (
                <Badge className="bg-success/20 text-success border-0 text-[10px]">
                  {passCount} PASS
                </Badge>
              )}
              {failCount > 0 && (
                <Badge className="bg-destructive/20 text-destructive border-0 text-[10px]">
                  {failCount} FAIL
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-lg border border-border">
            <Table>
              <TableHeader>
                <TableRow className="border-border bg-muted/30 hover:bg-muted/30">
                  <TableHead className="text-xs text-muted-foreground">#</TableHead>
                  <TableHead className="text-xs text-muted-foreground">Characteristic</TableHead>
                  <TableHead className="text-xs text-muted-foreground">Tool</TableHead>
                  <TableHead className="text-xs text-muted-foreground text-right">Min</TableHead>
                  <TableHead className="text-xs text-muted-foreground text-right">Max</TableHead>
                  <TableHead className="text-xs text-muted-foreground text-right">Actual Reading</TableHead>
                  <TableHead className="text-xs text-muted-foreground text-center">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {inspectionSpecs.map((spec) => (
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
                    <TableCell className="text-right font-mono text-muted-foreground">{spec.min}</TableCell>
                    <TableCell className="text-right font-mono text-muted-foreground">{spec.max}</TableCell>
                    <TableCell className="text-right">
                      <Input
                        type="number"
                        step="0.01"
                        value={spec.actual ?? ""}
                        onChange={(e) => handleActualChange(spec.id, e.target.value)}
                        disabled={lotReleased || lotRejected || isReadOnly}
                        placeholder="Enter..."
                        className={cn(
                          "h-10 w-24 ml-auto text-right font-mono border-border bg-muted/30 text-foreground placeholder:text-muted-foreground/50",
                          spec.status === "fail" && "border-destructive bg-destructive/10 text-destructive",
                          spec.status === "pass" && "border-success bg-success/10 text-success"
                        )}
                      />
                    </TableCell>
                    <TableCell className="text-center">
                      {spec.status === "pending" && (
                        <Badge variant="secondary" className="text-[10px] bg-muted text-muted-foreground">
                          PENDING
                        </Badge>
                      )}
                      {spec.status === "pass" && (
                        <div className="flex items-center justify-center gap-1">
                          <CheckCircle2 className="h-4 w-4 text-success" />
                          <span className="text-xs font-semibold text-success">PASS</span>
                        </div>
                      )}
                      {spec.status === "fail" && (
                        <div className="flex items-center justify-center gap-1">
                          <AlertTriangle className="h-4 w-4 text-destructive" />
                          <span className="text-xs font-semibold text-destructive">FAIL</span>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {hasFailures && (
            <div className="mt-3 flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3">
              <XCircle className="h-4 w-4 text-destructive" />
              <span className="text-xs font-medium text-destructive">
                OUT OF TOLERANCE detected. Review readings before proceeding.
              </span>
            </div>
          )}

          {allPass && (
            <div className="mt-3 flex items-center gap-2 rounded-lg border border-success/30 bg-success/10 p-3">
              <CheckCircle2 className="h-4 w-4 text-success" />
              <span className="text-xs font-medium text-success">
                All characteristics within tolerance. Lot is eligible for release.
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Final Verdict */}
      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <ShieldCheck className="h-4 w-4 text-primary" />
            Final Verdict
          </CardTitle>
        </CardHeader>
        <CardContent>
          {lotReleased ? (
            <div className="rounded-lg border-2 border-success bg-success/10 p-6 text-center">
              <CheckCircle2 className="mx-auto mb-2 h-12 w-12 text-success" />
              <h3 className="text-lg font-bold text-success">LOT APPROVED</h3>
              <p className="text-sm text-success/80">Released for shipment at {new Date().toLocaleTimeString()}</p>
            </div>
          ) : lotRejected ? (
            <div className="rounded-lg border-2 border-destructive bg-destructive/10 p-6 text-center">
              <XCircle className="mx-auto mb-2 h-12 w-12 text-destructive" />
              <h3 className="text-lg font-bold text-destructive">LOT REJECTED</h3>
              <p className="text-sm text-destructive/80">Non-conformance report generated at {new Date().toLocaleTimeString()}</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <Button
                onClick={() => setConfirmDialog("approve")}
                className="h-14 gap-2 bg-success text-sm font-bold text-success-foreground hover:bg-success/90"
              >
                <ShieldCheck className="h-5 w-5" />
                APPROVE RELEASE
              </Button>
              <Button
                onClick={() => setConfirmDialog("reject")}
                className="h-14 gap-2 bg-destructive text-sm font-bold text-destructive-foreground hover:bg-destructive/90"
              >
                <ShieldX className="h-5 w-5" />
                REJECT LOT
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialog !== null} onOpenChange={() => setConfirmDialog(null)}>
        <DialogContent className="bg-card border-border text-foreground">
          <DialogHeader>
            <DialogTitle className="text-foreground">
              {confirmDialog === "approve" ? "Confirm Lot Approval" : "Confirm Lot Rejection"}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              {confirmDialog === "approve"
                ? "You are about to approve Lot #296039 for release. This action will be logged in the audit trail."
                : "You are about to reject Lot #296039. A non-conformance report will be generated automatically."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setConfirmDialog(null)}
              className="border-border text-foreground"
            >
              Cancel
            </Button>
            {confirmDialog === "approve" ? (
              <Button onClick={handleApprove} className="bg-success text-success-foreground hover:bg-success/90">
                Confirm Approval
              </Button>
            ) : (
              <Button onClick={handleReject} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Confirm Rejection
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
