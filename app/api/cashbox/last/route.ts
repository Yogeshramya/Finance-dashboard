import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getToken } from "next-auth/jwt";
import CashBox from "@/models/CashBox";

const secret = process.env.NEXTAUTH_SECRET!;

export async function GET(req: NextRequest) {
    await connectDB();

    const token = await getToken({ req, secret });
    if (!token) {
        return NextResponse.json(
            { success: false, error: "Unauthorized" },
            { status: 401 }
        );
    }

    const lastCashBox = await CashBox.findOne({
        branch: token.branch?._id,
        status: "APPROVED",
    })
        .sort({ date: -1 }) //latest closed
        .lean();

    return NextResponse.json({
        success: true,
        cashbox: lastCashBox || null,
    });
}
