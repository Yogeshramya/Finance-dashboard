import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import SavingsApproval from "@/models/Savings";
import SavingsDraft from "@/models/SavingsDraft";
import { getToken } from "next-auth/jwt";

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

        const { customerId, savings } = await req.json();

        if (!customerId) {
            return NextResponse.json({
                success: false,
                error: "Customer required",
            });
        }

        /* -------- Prevent duplicate pending -------- */

        const existing = await SavingsApproval.findOne({
            customer: customerId,
            status: "PENDING",
        });

        if (existing) {
            return NextResponse.json({
                success: false,
                error: "Savings return already requested",
            });
        }

        /* -------- Create approval request -------- */

        const approval = await SavingsApproval.create({
            customer: customerId,
            branch: token.branch?._id,
            savingsAmount: Number(savings || 0),
            requestedBy: token.id,
        });

        /* -------- Mark draft requested -------- */

        await SavingsDraft.findOneAndUpdate(
            { customerId },
            { savingsRequested: true },
            { new: true }
        );

        return NextResponse.json({
            success: true,
            approvalId: approval._id,
        });

    } catch (err) {

        console.error("Savings request error:", err);

        return NextResponse.json({
            success: false,
            error: "Server error",
        });
    }
}