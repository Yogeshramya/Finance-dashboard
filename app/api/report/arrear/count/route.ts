import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { connectDB } from "@/lib/db";
import ArrearLoan from "@/models/Arrear";

const secret = process.env.NEXTAUTH_SECRET!;

export async function GET(req: NextRequest) {
    try {
        await connectDB();

        const token = await getToken({ req, secret });
        if (!token)
            return NextResponse.json({ success: false }, { status: 401 });

        const count = await ArrearLoan.countDocuments({
            branch: token.branch?._id,
            status: "OPEN"
        });

        return NextResponse.json({
            success: true,
            count,
        });
    } catch (err) {
        console.error("Arrear count error", err);
        return NextResponse.json({ success: false }, { status: 500 });
    }
}
