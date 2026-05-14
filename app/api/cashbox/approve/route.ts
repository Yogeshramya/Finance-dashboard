import { connectDB } from "@/lib/db";
import CashBox from "@/models/CashBox";
import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

const secret = process.env.NEXTAUTH_SECRET!;

export async function POST(req: NextRequest) {
    try {
        await connectDB();

        const token = await getToken({ req, secret });
        if (!token)
            return NextResponse.json({ success: false }, { status: 401 });

        const { id } = await req.json();

        await CashBox.findByIdAndUpdate(id, {
            status: "APPROVED",
            approvedBy: token.id,
            approvedAt: new Date(),
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("CashBox approve error:", error);
        return NextResponse.json(
            { success: false, error: "Approval failed" },
            { status: 500 }
        );
    }
}
