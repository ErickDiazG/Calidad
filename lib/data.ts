// ==========================================
// TYPES
// ==========================================
export type Role = "operator" | "inspector" | "manager"

export interface LotInfo {
  partNumber: string
  orderNumber: string
  lotHeatNumber: string
  qtyRequired: number
  standard: string
}

export interface DefectCode {
  code: string
  description: string
}

export interface InspectionSpec {
  id: number
  characteristic: string
  tool: string
  min: number
  max: number
  actual: number | null
  status: "pending" | "pass" | "fail"
}

export interface AuditEntry {
  id: number
  timestamp: string
  user: string
  role: string
  action: string
}

export interface KpiData {
  lotsReleasedToday: number
  avgCycleTime: string
  firstPassYield: string
  topDefects: { code: string; count: number }[]
}

// ==========================================
// MOCK DATA
// ==========================================
export const SCANNED_LOT: LotInfo = {
  partNumber: "320-52761",
  orderNumber: "EAC260201",
  lotHeatNumber: "296039",
  qtyRequired: 3300,
  standard: "ASTM A 967-05",
}

export const DEFECT_CODES: DefectCode[] = [
  { code: "Z02", description: "OXIDO EN SUPERFICIE" },
  { code: "Z03", description: "DAÑADO (GOLPES/MARCAS)" },
  { code: "Z04", description: "MAL PLATINADO" },
  { code: "Z05", description: "REBABA" },
  { code: "Z06", description: "POROSIDAD" },
  { code: "Z07", description: "GRIETA" },
  { code: "Z08", description: "ACABADO DEFICIENTE" },
  { code: "Z09", description: "CONTAMINACION" },
  { code: "Z10", description: "DIMENSION FUERA DE ESPEC" },
  { code: "Z11", description: "DIAMETRO EXTERIOR GRANDE" },
  { code: "Z12", description: "DIAMETRO EXTERIOR CHICO" },
  { code: "Z13", description: "DIAMETRO INTERIOR GRANDE" },
  { code: "Z14", description: "DIAMETRO INTERIOR CHICO" },
  { code: "Z15", description: "LONGITUD FUERA DE ESPEC" },
  { code: "Z16", description: "ESPESOR FUERA DE ESPEC" },
  { code: "Z17", description: "CONCENTRICIDAD FUERA" },
  { code: "Z18", description: "PLANICIDAD FUERA" },
  { code: "Z19", description: "PERPENDICULARIDAD FUERA" },
  { code: "Z20", description: "PARALELISMO FUERA" },
  { code: "Z21", description: "ANGULARIDAD FUERA" },
  { code: "Z22", description: "RUGOSIDAD FUERA DE ESPEC" },
  { code: "Z23", description: "DUREZA FUERA DE ESPEC" },
  { code: "Z24", description: "TRATAMIENTO TERMICO MAL" },
  { code: "Z25", description: "RECUBRIMIENTO DEFICIENTE" },
  { code: "Z26", description: "SOLDADURA DEFECTUOSA" },
  { code: "Z27", description: "MATERIAL INCORRECTO" },
  { code: "Z28", description: "IDENTIFICACION INCORRECTA" },
  { code: "Z29", description: "EMPAQUE INADECUADO" },
  { code: "Z30", description: "CERTIFICADO FALTANTE" },
  { code: "Z31", description: "CANTIDAD INCORRECTA" },
  { code: "Z32", description: "MEZCLA DE PARTES" },
  { code: "Z42", description: "ROSCAS FUERA DE ESPEC" },
  { code: "Z99", description: "OTRO DEFECTO" },
]

export const INITIAL_SPECS: InspectionSpec[] = [
  { id: 1, characteristic: "Distancia", tool: "Vernier", min: 0.47, max: 0.53, actual: null, status: "pending" },
  { id: 2, characteristic: "Radio", tool: "Vernier", min: 0.22, max: 0.28, actual: null, status: "pending" },
  { id: 3, characteristic: "Diametro Hole", tool: "Pin Gauge", min: 0.25, max: 0.31, actual: null, status: "pending" },
  { id: 4, characteristic: "Angulo", tool: "Protractor", min: 44.5, max: 45.5, actual: null, status: "pending" },
]

export const MOCK_AUDIT_LOG: AuditEntry[] = [
  { id: 1, timestamp: "2026-02-06 08:12:34", user: "Carlos M.", role: "Operator", action: "Scanned Lot #296039" },
  { id: 2, timestamp: "2026-02-06 08:13:01", user: "Carlos M.", role: "Operator", action: "Entered Finish Qty: 3280, Scrap: 20" },
  { id: 3, timestamp: "2026-02-06 08:13:45", user: "Carlos M.", role: "Operator", action: "Selected Defect: Z03 - DAÑADO" },
  { id: 4, timestamp: "2026-02-06 08:20:12", user: "Maria S.", role: "Inspector", action: "Began Dimensional Inspection" },
  { id: 5, timestamp: "2026-02-06 08:22:50", user: "Maria S.", role: "Inspector", action: "All 4 characteristics PASS" },
  { id: 6, timestamp: "2026-02-06 08:23:10", user: "Maria S.", role: "Inspector", action: "APPROVED RELEASE - Lot #296039" },
]

export const MOCK_KPI: KpiData = {
  lotsReleasedToday: 14,
  avgCycleTime: "4m 52s",
  firstPassYield: "96.2%",
  topDefects: [
    { code: "Z03", count: 12 },
    { code: "Z10", count: 8 },
    { code: "Z02", count: 6 },
    { code: "Z42", count: 4 },
    { code: "Z11", count: 3 },
    { code: "Z04", count: 2 },
  ],
}
