import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getToken } from "next-auth/jwt";
import Savings from "@/models/Savings";

const secret = process.env.NEXTAUTH_SECRET!;

export async function POST(req: NextRequest) {
    try {
        await connectDB();

        const token = await getToken({ req, secret });

        if (!token) {
            return NextResponse.json(
                { success: false, error: "Unauthorized" },
                { status: 401 }
            );
        }

        const { id, remarks } = await req.json();

        if (!id) {
            return NextResponse.json(
                { success: false, error: "Request ID required" },
                { status: 400 }
            );
        }

        const approval = await Savings.findById(id);

        if (!approval || approval.status !== "PENDING") {
            return NextResponse.json(
                { success: false, error: "Invalid approval request" },
                { status: 400 }
            );
        }

        approval.status = "REJECTED";
        approval.approvedBy = token.id;
        approval.approvedAt = new Date();
        approval.remarks = remarks || "";

        await approval.save();

        return NextResponse.json({ success: true });

    } catch (err) {

        console.error("Savings reject error:", err);

        return NextResponse.json(
            { success: false, error: "Server error" },
            { status: 500 }
        );
    }
}