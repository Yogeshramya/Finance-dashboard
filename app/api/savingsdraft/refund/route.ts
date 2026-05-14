import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import SavingsDraft from "@/models/SavingsDraft";

export async function POST(req: NextRequest) {
    try {
        await connectDB();

        const { customerId } = await req.json();

        /* ================= VALIDATION ================= */

        if (!customerId) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Customer ID required",
                },
                { status: 400 }
            );
        }

        /* ================= FIND DRAFT ================= */

        const draft = await SavingsDraft.findOne({ customerId });

        if (!draft) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Draft not found",
                },
                { status: 404 }
            );
        }

        if (draft.refunded) {
            return NextResponse.json({
                success: false,
                error: "Savings already refunded",
            });
        }

        /* ================= MARK REFUNDED ================= */

        //draft.refunded = true;

        /* ================= CLEAR DATA ================= */

        draft.entries = [];
        draft.totalSavings = 0;
        draft.savingsAmount = 0;

        await draft.save();

        return NextResponse.json({
            success: true,
            message: "Savings draft cleared after refund",
        });

    } catch (err) {
        console.log("SavingsDraft refund error:", err);
        return NextResponse.json(
            {
                success: false,
                error: "Server error",
            },
            { status: 500 }
        );
    }
}