import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Loan from "@/models/Loan";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    await connectDB();

    const { remarks } = await req.json();
    const { id } = await params;

    const updated = await Loan.findByIdAndUpdate(
        id,
        { status: "REJECTED", approvalRemarks: remarks, rejectedAt: new Date() },
        { returnDocument: 'after' }
    );

    return NextResponse.json(updated);
}
