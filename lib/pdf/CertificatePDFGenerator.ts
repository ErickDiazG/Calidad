/**
 * @fileoverview Certificate of Conformance PDF Generator
 * Creates a 1:1 visual replica of the official RBC certificate format
 * Styled to look like a scanned official document
 * @module lib/pdf/CertificatePDFGenerator
 */

import jsPDF from "jspdf"
import { format } from "date-fns"

// ==========================================
// TYPES
// ==========================================

export interface CertificateData {
    certNumber: string
    customer: string
    partNumber: string
    revision: string
    drawingNumber: string
    customerPartNumber?: string
    customerDwgRevision?: string
    lotNumber: string
    productDescription: string
    rawMaterialHeatNumber: string
    quantity: number
    processingDate: string
    specifications: string
    method: string
    type?: string
    class?: string
    test?: string
    qualityInspector: string
    signatureDate: string
}

// ==========================================
// HARDCODED DEMO DATA
// ==========================================

export const DEMO_CERTIFICATE_DATA: CertificateData = {
    // Generates format BO-DDMMYY-01 matches reference
    certNumber: `BO-${format(new Date(), "ddMMyy")}-01`,
    customer: "RBC HARTSVILLE",
    partNumber: "320-52761",
    revision: "F",
    drawingNumber: "320-52761",
    customerPartNumber: "N/A",
    customerDwgRevision: "N/A",
    lotNumber: "296039",
    productDescription: "OUTER RING",
    rawMaterialHeatNumber: "R3699",
    quantity: 3300,
    processingDate: format(new Date(), "d/M/yyyy"),
    specifications: "RBC PS-20 REV. NC (AMS-2485M and MIL-DTL-13924F)",
    method: "Hot Alkaline-Oxidizing",
    type: "N/A",
    class: "(Class-1)",
    test: "Oxalic Acid Spot Test",
    qualityInspector: "Gael Ramirez",
    signatureDate: format(new Date(), "dd-MMM-yy"),
}

// ==========================================
// PDF GENERATOR - 1:1 REPLICA (FINE TUNED)
// ==========================================

export function generateCertificatePDF(data: CertificateData = DEMO_CERTIFICATE_DATA): void {
    const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "letter",
    })

    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()

    // Layout constants matching the reference scan
    const borderMargin = 12
    const contentMargin = 22
    const labelX = contentMargin
    const valueX = 90  // Aligned values column

    // Branding Colors
    const darkBlue: [number, number, number] = [0, 51, 153]  // RBC Blue #003399
    const black: [number, number, number] = [0, 0, 0]

    // =========== DOUBLE BORDER ===========
    // Outer thick border
    doc.setDrawColor(...darkBlue)
    doc.setLineWidth(0.8)
    doc.rect(borderMargin, borderMargin, pageWidth - 2 * borderMargin, pageHeight - 2 * borderMargin)
    // Inner thin border (offset by 1.5mm)
    doc.setLineWidth(0.3)
    doc.rect(borderMargin + 1.5, borderMargin + 1.5, pageWidth - 2 * borderMargin - 3, pageHeight - 2 * borderMargin - 3)

    // =========== HEADER ===========

    // Cert Number (Top Right)
    doc.setTextColor(...black)
    doc.setFontSize(10)
    doc.setFont("helvetica", "normal")
    // "Cert. No."
    doc.text("Cert. No.", pageWidth - 55, 20)
    doc.setFont("helvetica", "bold")
    // "BO-XXXXXX-XX"
    doc.text(data.certNumber, pageWidth - 36, 20)

    // RBC Logo (Top Left) - Simulated with Text
    doc.setTextColor(...darkBlue)
    doc.setFontSize(32)
    doc.setFont("helvetica", "bold")
    doc.text("RBC", contentMargin, 28)

    doc.setFontSize(7)
    doc.setFont("helvetica", "bold")
    doc.text("DE MEXICO", contentMargin, 33)

    doc.setFontSize(5)
    doc.setFont("helvetica", "normal")
    doc.text("S. DE R.L. DE C.V.", contentMargin, 35.5)

    // Title (Center)
    doc.setTextColor(...darkBlue)
    doc.setFontSize(14)
    doc.setFont("helvetica", "bold")
    doc.text("CERTIFICATE OF CONFORMANCE", pageWidth / 2, 28, { align: "center" })

    doc.setFontSize(9)
    doc.setFont("helvetica", "normal")
    doc.text("Internal Processing", pageWidth / 2, 33, { align: "center" })

    doc.setFont("helvetica", "bold")
    doc.text("Black Oxide", pageWidth / 2, 37, { align: "center" })

    // =========== HORIZONTAL LINE ===========
    doc.setDrawColor(...darkBlue)
    doc.setLineWidth(0.4)
    doc.line(contentMargin, 45, pageWidth - contentMargin, 45)

    // =========== INFO SECTION (Key-Value List) ===========

    doc.setTextColor(...black)
    let currentY = 55
    const lineSpacing = 6.5

    // Helper function for key-value pairs
    // Labels are bold, Values are normal, separate columns
    const drawKeyValue = (label: string, value: string, y: number) => {
        doc.setFontSize(9)
        doc.setFont("helvetica", "bold")
        doc.text(label, labelX, y)
        doc.setFont("helvetica", "normal")
        doc.text(value, valueX, y)
    }

    drawKeyValue("Customer:", data.customer, currentY)
    currentY += lineSpacing

    drawKeyValue("P/N:", data.partNumber, currentY)
    currentY += lineSpacing

    drawKeyValue("Rev:", data.revision, currentY)
    currentY += lineSpacing

    drawKeyValue("Drawing no. or PCN:", data.drawingNumber, currentY)
    currentY += lineSpacing

    drawKeyValue("Customer Part Number(if applicable):", data.customerPartNumber || "N/A", currentY)
    currentY += lineSpacing

    drawKeyValue("Customer Dwg Revision(if applicable)", data.customerDwgRevision || "N/A", currentY)
    currentY += lineSpacing

    drawKeyValue("Lot/WO:", data.lotNumber, currentY)
    currentY += lineSpacing

    drawKeyValue("Product Description:", data.productDescription, currentY)
    currentY += lineSpacing

    drawKeyValue("Raw Material Heat Number:", data.rawMaterialHeatNumber, currentY)
    currentY += lineSpacing

    drawKeyValue("Quantity", data.quantity.toLocaleString(), currentY)
    currentY += lineSpacing

    drawKeyValue("Processing Date:", data.processingDate, currentY)
    currentY += lineSpacing + 8

    // =========== CERTIFICATION STATEMENT ===========

    // Thin line separator above statement
    doc.setDrawColor(...darkBlue)
    doc.setLineWidth(0.2)
    doc.line(contentMargin, currentY - 5, pageWidth - contentMargin, currentY - 5)

    const statement = "We hereby certify that the product/s described above were processed in accordance with the specification(s) and drawing requirements stated below, and conforms to all purchase order requirements."

    doc.setFontSize(8)
    doc.setFont("helvetica", "italic")
    const splitStatement = doc.splitTextToSize(statement, pageWidth - 2 * contentMargin - 5)
    doc.text(splitStatement, pageWidth / 2, currentY + 2, { align: "center" })

    currentY += 15

    // =========== SPECIFICATIONS SECTION ===========

    // Thin line separator above specs
    doc.line(contentMargin, currentY, pageWidth - contentMargin, currentY)
    currentY += 10

    // Specs layout
    drawKeyValue("Specifications:", data.specifications, currentY)
    currentY += lineSpacing + 4

    drawKeyValue("Method:", data.method, currentY)
    currentY += lineSpacing + 4

    drawKeyValue("Type:", data.type || "N/A", currentY)
    currentY += lineSpacing

    drawKeyValue("Class:", data.class || "N/A", currentY)
    currentY += lineSpacing

    drawKeyValue("Test:", data.test || "N/A", currentY)

    // =========== SIGNATURE SECTION ===========

    const sigY = pageHeight - 65
    const sigLineLength = 60

    // Left: Quality Inspector
    doc.setFontSize(10)
    doc.setFont("helvetica", "bold")
    doc.text("Quality Inspector", labelX, sigY + 5)

    // Signature Line
    doc.setDrawColor(...black)
    doc.setLineWidth(0.5)
    doc.line(labelX + 32, sigY + 5, labelX + 32 + sigLineLength, sigY + 5)

    // Simulated Signature (Italic Times font)
    doc.setFontSize(12)
    doc.setFont("times", "italic")
    doc.text(data.qualityInspector, labelX + 40, sigY + 2)

    // Right: Date
    const dateLabelX = pageWidth - contentMargin - 50
    doc.setFontSize(10)
    doc.setFont("helvetica", "bold")
    doc.text("Date:", dateLabelX, sigY + 5)

    // Amount of space for date
    doc.line(dateLabelX + 12, sigY + 5, pageWidth - contentMargin, sigY + 5)
    doc.setFont("helvetica", "normal")
    // Use manually formatted date string
    doc.text(data.signatureDate, dateLabelX + 22, sigY + 2)

    // =========== FOOTER ===========

    // Footer Line
    doc.setDrawColor(...darkBlue)
    doc.setLineWidth(0.4)
    doc.line(contentMargin, pageHeight - 45, pageWidth - contentMargin, pageHeight - 45)

    // Disclaimer
    const footerY = pageHeight - 38
    doc.setFontSize(6)
    doc.setFont("helvetica", "normal")

    const disclaimer = [
        "Cuando sea impreso, este documento no es controlado a menos que sea identificado por Control de documentos.",
        "When printed, this document is not controlled unless it is identified by Document Control."
    ]
    doc.text(disclaimer[0], pageWidth / 2, footerY, { align: "center" })
    doc.text(disclaimer[1], pageWidth / 2, footerY + 3, { align: "center" })

    // Address
    const addressY = footerY + 9
    const address = [
        "Avenida 16 de Septiembre Parque Industrial Reynosa C.P. 88780",
        "Planta 1 Lote 11, Planta 2 Lote 3, Planta 3 Lote 14",
        "Planta 4 Ave. Mike Allen #1320 esq. Ave. 16 de Septiembre C.P. 88787"
    ]
    doc.text(address[0], pageWidth / 2, addressY, { align: "center" })
    doc.text(address[1], pageWidth / 2, addressY + 3, { align: "center" })
    doc.text(address[2], pageWidth / 2, addressY + 6, { align: "center" })

    // Revision Control (Bottom RIGHT)
    doc.setFontSize(8)
    doc.setFont("helvetica", "bold")
    // Align right near the border margin
    doc.text("QS-P6-FP Rev.06", pageWidth - borderMargin - 8, pageHeight - borderMargin - 5, { align: "right" })

    // =========== SAVE PDF ===========

    doc.save(`Cert_RBC_${data.lotNumber}.pdf`)
}

// ==========================================
// REACT HOOK
// ==========================================

export function useCertificatePDF() {
    const generatePDF = (customData?: Partial<CertificateData>) => {
        const finalData = customData
            ? { ...DEMO_CERTIFICATE_DATA, ...customData }
            : DEMO_CERTIFICATE_DATA

        generateCertificatePDF(finalData)
    }

    return { generatePDF, DEMO_CERTIFICATE_DATA }
}
