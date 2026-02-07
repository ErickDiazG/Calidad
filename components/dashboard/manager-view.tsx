"use client"

import {
  Timer,
  Package,
  TrendingUp,
  AlertTriangle,
  FileText,
  ArrowDown,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { MOCK_KPI, MOCK_AUDIT_LOG, DEFECT_CODES } from "@/lib/data"
import {
  Bar,
  BarChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts"

const BAR_COLORS = [
  "hsl(0, 72%, 51%)",
  "hsl(0, 72%, 58%)",
  "hsl(38, 92%, 50%)",
  "hsl(38, 92%, 58%)",
  "hsl(213, 94%, 52%)",
  "hsl(213, 94%, 60%)",
]

const kpiCards = [
  {
    label: "Cycle Time Reduction",
    value: "40m → 5m",
    subtext: "87.5% reduction",
    icon: Timer,
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    label: "Lots Released Today",
    value: String(MOCK_KPI.lotsReleasedToday),
    subtext: "Avg cycle: " + MOCK_KPI.avgCycleTime,
    icon: Package,
    color: "text-success",
    bgColor: "bg-success/10",
  },
  {
    label: "First Pass Yield",
    value: MOCK_KPI.firstPassYield,
    subtext: "Target: 95%",
    icon: TrendingUp,
    color: "text-success",
    bgColor: "bg-success/10",
  },
  {
    label: "Top Defect",
    value: "Z03",
    subtext: DEFECT_CODES.find((d) => d.code === "Z03")?.description || "",
    icon: AlertTriangle,
    color: "text-destructive",
    bgColor: "bg-destructive/10",
  },
]

const paretoData = MOCK_KPI.topDefects.map((d) => ({
  name: d.code,
  count: d.count,
  desc: DEFECT_CODES.find((dc) => dc.code === d.code)?.description || "",
}))

export function ManagerView() {
  return (
    <div className="space-y-4">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {kpiCards.map((kpi) => {
          const Icon = kpi.icon
          return (
            <Card key={kpi.label} className="border-border bg-card">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">{kpi.label}</p>
                    <p className="text-2xl font-bold text-foreground">{kpi.value}</p>
                    <p className="text-[10px] text-muted-foreground">{kpi.subtext}</p>
                  </div>
                  <div className={`rounded-lg ${kpi.bgColor} p-2`}>
                    <Icon className={`h-5 w-5 ${kpi.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Pareto Chart */}
        <Card className="border-border bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <ArrowDown className="h-4 w-4 text-primary" />
              Pareto of Defects
              <Badge variant="secondary" className="ml-auto text-[10px] bg-secondary text-secondary-foreground">
                LAST 30 DAYS
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={paretoData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="hsl(215, 20%, 20%)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: "hsl(215, 15%, 55%)", fontSize: 11 }}
                    axisLine={{ stroke: "hsl(215, 20%, 20%)" }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: "hsl(215, 15%, 55%)", fontSize: 11 }}
                    axisLine={{ stroke: "hsl(215, 20%, 20%)" }}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(215, 25%, 11%)",
                      border: "1px solid hsl(215, 20%, 20%)",
                      borderRadius: "8px",
                      color: "hsl(210, 20%, 92%)",
                      fontSize: 12,
                    }}
                    formatter={(value: number, _name: string, props: { payload: { desc: string } }) => [
                      `${value} occurrences`,
                      props.payload.desc,
                    ]}
                  />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {paretoData.map((_entry, index) => (
                      <Cell key={`cell-${index}`} fill={BAR_COLORS[index % BAR_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Top Defects Table */}
        <Card className="border-border bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <AlertTriangle className="h-4 w-4 text-warning" />
              Top Defects Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {MOCK_KPI.topDefects.map((defect, idx) => {
                const maxCount = MOCK_KPI.topDefects[0].count
                const pct = (defect.count / maxCount) * 100
                const desc = DEFECT_CODES.find((d) => d.code === defect.code)?.description
                return (
                  <div key={defect.code} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-5 text-right text-xs text-muted-foreground font-mono">
                          {idx + 1}.
                        </span>
                        <span className="text-xs font-mono font-semibold text-primary">{defect.code}</span>
                        <span className="text-xs text-muted-foreground">{desc}</span>
                      </div>
                      <Badge variant="secondary" className="text-[10px] font-mono bg-secondary text-secondary-foreground">
                        {defect.count}
                      </Badge>
                    </div>
                    <div className="ml-7 h-1.5 rounded-full bg-muted">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${pct}%`,
                          backgroundColor:
                            idx === 0
                              ? "hsl(0, 72%, 51%)"
                              : idx === 1
                                ? "hsl(38, 92%, 50%)"
                                : "hsl(213, 94%, 52%)",
                        }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Audit Log */}
      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <FileText className="h-4 w-4 text-primary" />
            Audit Log
            <Badge variant="secondary" className="ml-auto text-[10px] bg-secondary text-secondary-foreground">
              {MOCK_AUDIT_LOG.length} ENTRIES
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-lg border border-border">
            <Table>
              <TableHeader>
                <TableRow className="border-border bg-muted/30 hover:bg-muted/30">
                  <TableHead className="text-xs text-muted-foreground">Timestamp</TableHead>
                  <TableHead className="text-xs text-muted-foreground">User</TableHead>
                  <TableHead className="text-xs text-muted-foreground">Role</TableHead>
                  <TableHead className="text-xs text-muted-foreground">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {MOCK_AUDIT_LOG.map((entry) => (
                  <TableRow key={entry.id} className="border-border">
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {entry.timestamp}
                    </TableCell>
                    <TableCell className="text-xs text-foreground font-medium">
                      {entry.user}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={
                          entry.role === "Operator"
                            ? "bg-primary/15 text-primary border-0 text-[10px]"
                            : entry.role === "Inspector"
                              ? "bg-success/15 text-success border-0 text-[10px]"
                              : "bg-warning/15 text-warning border-0 text-[10px]"
                        }
                      >
                        {entry.role}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-foreground">{entry.action}</TableCell>
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
