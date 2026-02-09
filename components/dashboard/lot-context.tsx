"use client"

import { QrCode, FileText, ImageIcon, Package, Hash, ClipboardList, Layers, Ruler, Expand } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import type { LotInfo } from "@/lib/data"
import Image from "next/image"

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
            const value = lot[item.key as keyof LotInfo]

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
          <Dialog>
            <DialogTrigger asChild>
              <div className="relative flex aspect-[4/3] cursor-zoom-in flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/30 hover:bg-muted/50 transition-colors overflow-hidden group">
                {lot.drawingUrl ? (
                  <>
                    <Image
                      src={lot.drawingUrl}
                      alt="Technical Drawing"
                      fill
                      className="object-contain p-2"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Expand className="h-8 w-8 text-white" />
                    </div>
                  </>
                ) : (
                  <>
                    <FileText className="mb-2 h-10 w-10 text-muted-foreground/50" />
                    <span className="text-xs font-medium text-muted-foreground">
                      No Drawing Available
                    </span>
                  </>
                )}
              </div>
            </DialogTrigger>
            {lot.drawingUrl && (
              <DialogContent className="max-w-5xl h-[90vh] p-0 overflow-hidden bg-background">
                <div className="relative h-full w-full">
                  <Image
                    src={lot.drawingUrl}
                    alt="Technical Drawing Full Screen"
                    fill
                    className="object-contain"
                  />
                </div>
              </DialogContent>
            )}
          </Dialog>
          <div className="mt-2 text-center">
            <span className="text-[10px] text-muted-foreground/70">
              Drawing: {lot.partNumber}-REV-{lot.standard.split(' ')[2] || 'D'}.jpg
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
          <div className="relative flex aspect-[4/3] flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/30 overflow-hidden">
            {lot.photoUrl ? (
              <Image
                src={lot.photoUrl}
                alt="Reference Part"
                fill
                className="object-cover"
              />
            ) : (
              <>
                <ImageIcon className="mb-2 h-10 w-10 text-muted-foreground/50" />
                <span className="text-xs font-medium text-muted-foreground">
                  No Photo Available
                </span>
              </>
            )}
          </div>
          <div className="mt-2 text-center">
            <span className="text-[10px] text-muted-foreground/70">
              Part: {lot.partNumber} (Visual Reference)
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
