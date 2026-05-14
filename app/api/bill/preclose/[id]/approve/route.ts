import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Bill from "@/models/Bill";
import Loan from "@/models/Loan";
import { getToken } from "next-auth/jwt";
import { Dues } from "@/types/fund";

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectDB();
        const { id } = await params;

        /* ---------- AUTH ---------- */
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

        /* ---------- BILL ---------- */
        const bill = await Bill.findById(id);
        if (!bill || bill.status !== "APPROVAL") {
            return NextResponse.json(
                { success: false, error: "Invalid bill state" },
                { status: 400 }
            );
        }

        /* ---------- LOAN ---------- */
        const loan = await Loan.findOne({ mfLoanId: bill.loans[0].loanId, branch: token.branch?._id });
        if (!loan) {
            return NextResponse.json(
                { success: false, error: "Loan not found" },
                { status: 404 }
            );
        }

        /* ---------- MARK ALL DUES PAID ---------- */
        loan.dues = loan.dues.map((d: Dues) => ({
            ...d,
            paid: true,
            savings: d.paid ? d.savings : 0, // remove savings for remaining dues
            total: d.paid ? d.total : d.principal + d.interest, // recalc total without savings
            paidAt: d.paid ? d.paidAt : new Date(),
        }));

        loan.status = "REPAID";
        await loan.save();

        /* ---------- APPROVE BILL ---------- */
        bill.status = "APPROVED";
        bill.approvedBy = token.id;
        bill.approvedAt = new Date();
        await bill.save();

        return NextResponse.json({
            success: true,
            message: "Pre-close approved and loan closed",
        });
    } catch (e) {
        console.error(e);
        return NextResponse.json(
            { success: false, error: "Approval failed" },
            { status: 500 }
        );
    }
}
