import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import SavingsDraft from "@/models/SavingsDraft";

export async function GET(req: NextRequest) {
    try {

        await connectDB();

        const customerId = req.nextUrl.searchParams.get("customerId");

        /* ================= VALIDATION ================= */

        if (!customerId) {
            return NextResponse.json({
                success: false,
                error: "customerId required",
            });
        }

        /* ================= FIND DRAFT ================= */

        let draft = await SavingsDraft.findOne({ customerId });

        /* ================= CREATE IF NOT EXISTS ================= */

        if (!draft) {

            draft = await SavingsDraft.create({
                customerId,
                savingsAmount: 0,
                totalSavings: 0,
                entries: [],
                refunded: false,
                savingsRequested: false,
                savingsReturned: false,
            });

        }

        return NextResponse.json({
            success: true,
            draft,
        });

    } catch (err) {

        console.log("SavingsDraft GET error:", err);

        return NextResponse.json({
            success: false,
            error: "Server error",
        });

    }
}