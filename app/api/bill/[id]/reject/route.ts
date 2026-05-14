import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { connectDB } from "@/lib/db";
import Bill from "@/models/Bill";

const secret = process.env.NEXTAUTH_SECRET!;

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectDB();

        const token = await getToken({ req, secret });
        const { id } = await params;

        if (!token) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const bill = await Bill.findById(id);

        if (!bill) {
            return NextResponse.json(
                { error: "Bill not found" },
                { status: 404 }
            );
        }

        if (bill.status !== "PENDING") {
            return NextResponse.json(
                { error: "Bill already processed" },
                { status: 400 }
            );
        }

        bill.status = "REJECTED";
        bill.rejectedBy = token.id;
        bill.rejectedAt = new Date();

        await bill.save();

        return NextResponse.json({
            success: true,
            message: "Bill rejected successfully",
        });
    } catch (error) {
        console.error("Reject bill error:", error);

        return NextResponse.json(
            { error: "Failed to reject bill" },
            { status: 500 }
        );
    }
}