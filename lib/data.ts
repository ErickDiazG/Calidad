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
  { code: "Z02", description: "OXIDO EN CUALQUIER SUPERFICIE DE LA PIEZA" },
  { code: "Z03", description: "DAÑADO (GOLPES/MARCAS)" },
  { code: "Z04", description: "MAL PLATINADO" },
  { code: "Z05", description: "VIBRADO" },
  { code: "Z06", description: "ACABADO FUERA DE ESPECIFICACION" },
  { code: "Z09", description: "CONTAMINACION" },
  { code: "Z10", description: "DIMENSION FUERA DE ESPECIFICACION" },
  { code: "Z11", description: "DIAMETRO EXTERIOR GRANDE" },
  { code: "Z12", description: "DIAMETRO EXTERIOR CHICO" },
  { code: "Z13", description: "DIAMETRO INTERIOR GRANDE" },
  { code: "Z14", description: "DIAMETRO INTERIOR CHICO" },
  { code: "Z15", description: "ESPESOR FUERA DE ESPECIFICACION" },
  { code: "Z16", description: "FRACTURAS" },
  { code: "Z22", description: "PARALELISMO FUERA DE ESPECIFICACION" },
  { code: "Z23", description: "POSICION VERDADERA FUERA DE ESPECIFICACION" },
  { code: "Z24", description: "CONCENTRICIDAD FUERA DE ESPECIFICACION" },
  { code: "Z25", description: "REDONDEZ FUERA DE ESPECIFICACION" },
  { code: "Z26", description: "RUN-OUT FUERA DE ESPECIFICACION" },
  { code: "Z27", description: "PLANICIDAD FUERA DE ESPECIFICACION" },
  { code: "Z28", description: "HEXAGONAL FUERA DE ESPECIFICACION" },
  { code: "Z33", description: "DUREZA FUERA DE ESPECIFICACION" },
  { code: "Z34", description: "PRODUNDIDAD DE DUREZA FUERA DE ESPECIFICACION" },
  { code: "Z35", description: "REVISION OBSOLETA" },
  { code: "Z36", description: "OPERACION FALTANTE" },
  { code: "Z38", description: "ERROR OV" },
  { code: "Z39", description: "PRUEBAS INGENIERIA" },
  { code: "Z40", description: "PRUEBAS DESTRUCTIVAS" },
  { code: "Z41", description: "PUESTA A PUNTO SETUP" },
  { code: "Z42", description: "ROSCAS FUERA DE ESPECIFICACION" },
  { code: "Z44", description: "TEFLON NO ADHERIDO-ADHESION TEST FAILURE" },
  { code: "Z48", description: "BROCHA, BROCA, INSERTOS DAÑADOS" },
  { code: "Z49", description: "HEXAGONAL FUERA DE CENTRO" },
  { code: "Z50", description: "SIN IDENTIFICACION  QUE PERMITA SU TRAZABILIDAD" },
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
