import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Loan from "@/models/Loan";
import SavingsApproval from "@/models/Savings";
import mongoose from "mongoose";
import { Dues } from "@/types/fund";

export async function GET(req: NextRequest) {
    try {

        await connectDB();

        const { searchParams } = new URL(req.url);
        const groupId = searchParams.get("groupId");

        if (!groupId) {
            return NextResponse.json(
                { success: false, error: "groupId required" },
                { status: 400 }
            );
        }

        /* ================= GET LOANS ================= */

        const loans = await Loan.find({
            group: new mongoose.Types.ObjectId(groupId),
            savingsRefunded: { $ne: true }
        })
            .populate("customer", "name phone")
            .lean();

        const result = [];

        for (const loan of loans) {

            /* ================= CHECK IF REQUEST EXISTS ================= */

            const approval = await SavingsApproval.findOne({
                customer: loan.customer?._id,
                status: "PENDING"
            });

            if (approval) continue;

            /* ================= CALCULATE LOAN SAVINGS ================= */

            const loanSavings = loan.dues?.reduce(
                (sum: number, d: Dues) =>
                    sum + (d.paid ? Number(d.savings || 0) : 0),
                0
            ) || 0;

            if (loanSavings <= 0) continue;

            result.push({
                loanId: loan._id,
                customerId: loan.customer?._id,
                name: loan.customer?.name,
                phone: loan.customer?.phone,
                loanSavings
            });
        }

        return NextResponse.json({
            success: true,
            loans: result
        });

    } catch (error) {

        console.error("Savings pending API error:", error);

        return NextResponse.json(
            { success: false, error: "Server error" },
            { status: 500 }
        );
    }
}