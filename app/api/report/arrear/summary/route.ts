import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { connectDB } from "@/lib/db";
import ArrearLoan from "@/models/Arrear";

const secret = process.env.NEXTAUTH_SECRET!;

export async function GET(req: NextRequest) {
    await connectDB();

    const token = await getToken({ req, secret });
    if (!token)
        return NextResponse.json({}, { status: 401 });

    const result = await ArrearLoan.aggregate([
        {
            $match: {
                branch: token.branch?._id,
            },
        },
        {
            $group: {
                _id: null,
                principal: { $sum: "$principal" },
                interest: { $sum: "$interest" },
                savings: { $sum: "$savings" },
                total: { $sum: "$totalAmount" },
                remaining: { $sum: "$remainingAmount" },
            },
        },
    ]);

    return NextResponse.json({
        success: true,
        summary: result[0] || {},
    });
}
