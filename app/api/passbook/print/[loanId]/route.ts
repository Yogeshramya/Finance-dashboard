import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getToken } from "next-auth/jwt";
import { PDFDocument } from "pdf-lib";
import fs from "fs";
import path from "path";

import Loan from "@/models/Loan";
import Client from "@/models/Client";
import Group from "@/models/Group";
import Scheme from "@/models/Scheme";
import User from "@/models/User";
import Branch from "@/models/Branch";
const secret = process.env.NEXTAUTH_SECRET!;

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ loanId: string }> }
) {
    await connectDB();

    const token = await getToken({ req, secret });
    if (!token) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { loanId } = await params;

    // Fetch loan with relations
    const loan = await Loan.findById(loanId)
        .populate([
            { path: "customer", model: Client },
            { path: "group", model: Group },
            { path: "scheme", model: Scheme },
            { path: "employee", model: User },
            { path: "branch", model: Branch }
        ]);

    if (!loan) {
        return NextResponse.json({ error: "Loan not found" }, { status: 404 });
    }

    const scheme = loan.scheme as Scheme;

    // Load scheme PDF template
    const templatePath = path.join(
        process.cwd(),
        "public",
        `${scheme.schemeId}.pdf`
    );

    if (!fs.existsSync(templatePath)) {
        return NextResponse.json(
            { error: "Scheme PDF template not found" },
            { status: 404 }
        );
    }

    const templateBytes = fs.readFileSync(templatePath);
    const pdfDoc = await PDFDocument.load(templateBytes);
    const page = pdfDoc.getPages()[0];

    const fontSize = 10;

    // Fill header fields (positions based on your PDF)
    page.drawText(loan.customer.name, { x: 165, y: 724, size: fontSize });
    page.drawText(loan.customer.customerCode, { x: 155, y: 700, size: fontSize });
    page.drawText(loan.group.groupName, { x: 155, y: 633, size: fontSize });
    page.drawText(loan.customer.phone, { x: 135, y: 675, size: fontSize });

    page.drawText(loan.branch.name, { x: 263, y: 745, size: fontSize });

    page.drawText(loan.customer.nominee?.name || "-", {
        x: 410,
        y: 724,
        size: fontSize,
    });

    page.drawText(loan.customer.nominee?.relation || "-", {
        x: 430,
        y: 700,
        size: fontSize,
    });

    page.drawText(loan.customer.nominee?.phone || "-", {
        x: 380,
        y: 653,
        size: fontSize,
    });

    page.drawText(
        new Date(loan.createdAt).toLocaleDateString(),
        { x: 440, y: 677, size: fontSize }
    );

    page.drawText(loan.branch.manager || "-", {
        x: 460,
        y: 76,
        size: fontSize,
    });

    page.drawText(loan.employee.name || "-", {
        x: 100,
        y: 76,
        size: fontSize,
    });

    const photoUrl = loan.customer.memberPhoto;

    if (photoUrl) {
        const imageBytes = await fetchImageBytes(photoUrl);
        const image = photoUrl.endsWith(".png")
            ? await pdfDoc.embedPng(imageBytes)
            : await pdfDoc.embedJpg(imageBytes);

        page.drawImage(image, {
            x: 447,
            y: 748,
            width: 110,
            height: 80,
        });
    }

    // Export PDF
    const pdfBytes = await pdfDoc.save();

    return new NextResponse(Buffer.from(pdfBytes), {
        headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition": `inline; filename="${scheme.schemeId}.pdf"`,
        },
    });
}

async function fetchImageBytes(url: string): Promise<Uint8Array> {
    const res = await fetch(url);
    if (!res.ok) throw new Error("Failed to fetch image");
    const arrayBuffer = await res.arrayBuffer();
    return new Uint8Array(arrayBuffer);
}
