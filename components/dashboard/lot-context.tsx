"use client"

import { QrCode, FileText, ImageIcon, Package, Hash, ClipboardList, Layers, Ruler } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { LotInfo } from "@/lib/data"

interface LotContextProps {
  lot: LotInfo
}

const infoItems = [
  { key: "partNumber", label: "Part #", icon: Hash },
  { key: "orderNumber", label: "Order #", icon: ClipboardList },
  { key: "lotHeatNumber", label: "Lot (Heat) #", icon: Layers },
  { key: "qtyRequired", label: "Qty Required", icon: Package },
  { key: "standard", label: "Standard", icon: Ruler },
] as const

export function LotContext({ lot }: LotContextProps) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {/* Lot Information */}
      <Card className="md:col-span-1 border-border bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <QrCode className="h-4 w-4 text-primary" />
            Scanned Lot
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {infoItems.map((item) => {
            const Icon = item.icon
            const value = lot[item.key]
            return (
              <div key={item.key} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">{item.label}</span>
                </div>
                <Badge variant="secondary" className="font-mono text-xs bg-secondary text-secondary-foreground">
                  {String(value)}
                </Badge>
              </div>
            )
          })}
          <div className="mt-3 rounded-lg border border-primary/30 bg-primary/5 p-2 text-center">
            <span className="text-xs font-medium text-primary">ONE-SCAN LOADED</span>
          </div>
        </CardContent>
      </Card>

      {/* Technical Drawing */}
      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <FileText className="h-4 w-4 text-primary" />
            Technical Drawing
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex aspect-[4/3] flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/30">
            <FileText className="mb-2 h-10 w-10 text-muted-foreground/50" />
            <span className="text-xs font-medium text-muted-foreground">
              Drawing: 320-52761-REV-C.pdf
            </span>
            <span className="mt-1 text-[10px] text-muted-foreground/70">
              Tap to view full document
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Reference Photo */}
      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <ImageIcon className="h-4 w-4 text-primary" />
            Reference Photo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex aspect-[4/3] flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/30">
            <ImageIcon className="mb-2 h-10 w-10 text-muted-foreground/50" />
            <span className="text-xs font-medium text-muted-foreground">
              Part: 320-52761
            </span>
            <span className="mt-1 text-[10px] text-muted-foreground/70">
              Reference image of finished part
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
