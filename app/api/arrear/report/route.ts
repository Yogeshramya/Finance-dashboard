import { connectDB } from "@/lib/db";
import ArrearLoan from "@/models/Arrear";
import { NextResponse } from "next/server";

export async function GET() {
    await connectDB();

    const arrears = await ArrearLoan.find()
        .populate("loan")
        .populate("group")
        .populate("branch")
        .populate("partialPayments.collectedBy")
        .sort({ createdAt: -1 });

    return NextResponse.json({ arrears });
}
