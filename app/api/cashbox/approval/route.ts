import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import CashBox from "@/models/CashBox";
import { getToken } from "next-auth/jwt";
const secret = process.env.NEXTAUTH_SECRET!;

export async function GET(req: NextRequest) {
    await connectDB();

    const token = await getToken({ req, secret });

    const records = await CashBox.find({ branch: token?.branch?._id, status: "PENDING" })
        .populate("branch", "name")
        .populate("employee", "name")
        .populate("approvedBy", "name")
        .sort({ createdAt: -1 })
        .lean();

    return NextResponse.json({
        success: true,
        records,
    });
}
