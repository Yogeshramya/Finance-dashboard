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
            return NextResponse.json(
                { success: false, error: "Unauthorized" },
                { status: 401 }
            );

        const { id, remarks } = await req.json();

        if (!id)
            return NextResponse.json(
                { success: false, error: "CashBox ID required" },
                { status: 400 }
            );

        const cashBox = await CashBox.findById(id);
        if (!cashBox)
            return NextResponse.json(
                { success: false, error: "CashBox not found" },
                { status: 404 }
            );

        // ❌ DO NOT DELETE
        cashBox.status = "REJECTED";
        cashBox.remarks = remarks || "";
        cashBox.approvedBy = token.id;
        cashBox.approvedAt = new Date();

        await cashBox.save();

        return NextResponse.json({
            success: true,
            message: "CashBox rejected",
        });
    } catch (error) {
        console.error("CashBox reject error:", error);
        return NextResponse.json(
            { success: false, error: "Server error" },
            { status: 500 }
        );
    }
}
