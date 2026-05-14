import { readFile } from "fs/promises";
import path from "path";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

export async function POST(req: Request) {
    try {
        const body = await req.json();

        const pdfPath = path.join(
            process.cwd(),
            "public/grt_form_updated.pdf"
        );

        const existingPdfBytes = await readFile(pdfPath);

        const pdfDoc = await PDFDocument.load(existingPdfBytes);
        const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

        const page = pdfDoc.getPages()[0];

        // ---- Draw text on dashed areas (adjust coordinates) ----
        page.drawText(body.leaderName || "", {
            x: 140,
            y: 620,
            size: 11,
            font,
            color: rgb(0, 0, 0),
        });

        page.drawText(body.husbandName || "", {
            x: 130,
            y: 595,
            size: 11,
            font,
            color: rgb(0, 0, 0),
        });

        page.drawText(body.date || "", {
            x: 370,
            y: 570,
            size: 11,
            font,
            color: rgb(0, 0, 0),
        });

        page.drawText(body.address || "", {
            x: 80,
            y: 570,
            size: 11,
            font,
        });

        // pdf-lib returns Uint8Array
        const pdfBytes = await pdfDoc.save();

        // ✅ FIX: wrap bytes in Blob
        const blob = new Blob([new Uint8Array(pdfBytes).buffer], {
            type: "application/pdf",
        });

        return new Response(blob, {
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition":
                    "attachment; filename=GRT_Filled.pdf",
            },
        });
    } catch (err) {
        console.error("PDF ERROR:", err);
        return new Response("Failed to generate PDF", { status: 500 });
    }
}
