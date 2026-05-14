import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Bill from "@/models/Bill";
import { getToken } from "next-auth/jwt";

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectDB();
        const { id } = await params;

        const token = await getToken({
            req,
            secret: process.env.NEXTAUTH_SECRET,
        });

        if (!token) {
            return NextResponse.json(
                { success: false, error: "Unauthorized" },
                { status: 401 }
            );
        }

        const bill = await Bill.findById(id);

        if (!bill || bill.status !== "APPROVAL") {
            return NextResponse.json(
                { success: false, error: "Invalid bill state" },
                { status: 400 }
            );
        }

        bill.status = "REJECTED";
        bill.approvedBy = token.id;
        bill.approvedAt = new Date();

        await bill.save();

        return NextResponse.json({
            success: true,
            message: "Pre-close rejected",
        });
    } catch (e) {
        console.error(e);
        return NextResponse.json(
            { success: false },
            { status: 500 }
        );
    }
}
