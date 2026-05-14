import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { connectDB } from "@/lib/db";
import ArrearLoan from "@/models/Arrear";

const secret = process.env.NEXTAUTH_SECRET!;

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectDB();
        const { id } = await params;

        const token = await getToken({ req, secret });
        if (!token)
            return NextResponse.json({ success: false }, { status: 401 });

        const arrear = await ArrearLoan.findOne({
            _id: id,
            branch: token.branch?._id,
        })
            .populate("group", "groupName")
            .populate("loan", "mfLoanId")
            .populate("partialPayments.collectedBy", "name");

        if (!arrear)
            return NextResponse.json(
                { success: false },
                { status: 404 }
            );

        return NextResponse.json({
            success: true,
            arrear,
        });
    } catch (err) {
        console.error("Fetch arrear error", err);
        return NextResponse.json(
            { success: false },
            { status: 500 }
        );
    }
}
