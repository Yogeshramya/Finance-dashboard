import { connectDB } from "@/lib/db";
import ArrearLoan from "@/models/Arrear";
import Credit from "@/models/Credit";
import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        await connectDB();

        const token = await getToken({
            req,
            secret: process.env.NEXTAUTH_SECRET!
        });

        if (!token)
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );

        const { arrearLoanId, amount, mode = "Cash" } = await req.json();

        /* ===== VALIDATION ===== */
        if (!arrearLoanId || typeof amount !== "number" || amount <= 0) {
            return NextResponse.json(
                { error: "Invalid payment data" },
                { status: 400 }
            );
        }

        const arrear = await ArrearLoan.findById(arrearLoanId);
        if (!arrear || arrear.status === "CLOSED") {
            return NextResponse.json(
                { error: "Invalid or closed arrear loan" },
                { status: 400 }
            );
        }

        /* ===== PREVENT OVERPAY ===== */
        if (amount > arrear.remainingAmount) {
            return NextResponse.json(
                {
                    error: `Payment exceeds remaining amount (₹${arrear.remainingAmount})`
                },
                { status: 400 }
            );
        }

        /* ===== APPLY PAYMENT ===== */
        arrear.partialPayments.push({
            amount,
            collectedBy: token.id
        });

        arrear.remainingAmount -= amount;

        if (arrear.remainingAmount === 0) {
            arrear.status = "CLOSED";
        }

        await arrear.save();

        /* ===== CREATE DEBIT ENTRY ===== */
        await Credit.create({
            date: new Date(),
            title: "Arrear Payment",
            details: `Arrear payment for Loan ${arrear.mfLoanId} (Weeks ${arrear.arrearFromWeek}–${arrear.arrearTillWeek})`,
            amount,
            mode,
            status: "APPROVED",
            approvedBy: token.id,
            approvedAt: new Date(),
            branch: token.branch?._id || null,
            employee: token.id
        });

        return NextResponse.json({
            success: true,
            arrear
        });

    } catch (err) {
        console.error("Arrear payment error:", err);
        return NextResponse.json(
            { error: "Failed to process arrear payment" },
            { status: 500 }
        );
    }
}
