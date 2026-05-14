import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Bill from "@/models/Bill";
import Loan from "@/models/Loan";
import { Dues } from "@/types/fund";
import { getToken } from "next-auth/jwt";

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    await connectDB();

    const { id } = await params;

    const bill = await Bill.findById(id);

    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET! });

    if (!bill) {
        return NextResponse.json({ error: "Bill not found" }, { status: 404 });
    }

    if (bill.status === "APPROVED") {
        return NextResponse.json({ error: "Already approved" }, { status: 400 });
    }

    for (const l of bill.loans) {

        const loan = await Loan.findOne({
            mfLoanId: l.loanId,
            branch: token?.branch?._id,
        });

        if (!loan) continue;

        const dueIndex = l.weekNo - 1;
        const due = loan.dues[dueIndex];

        if (!due) continue;

        due.present = l.present;

        const totalDueAmount = due.total || 0;
        const previousPaid = due.paidAmount || 0;

        const newPaidAmount = previousPaid + l.paidAmount;
        const remainingAmount = totalDueAmount - newPaidAmount;

        due.paidAmount = newPaidAmount;
        due.remainingAmount = remainingAmount;

        loan.collections.push({
            weekNo: l.weekNo,
            amount: l.paidAmount,
            collectedAt: bill.collectedAt,
        });

        if (remainingAmount > 0) {
            due.isPartial = true;
            due.paid = true;
            loan.status = "PARTIAL";
        } else {
            due.paid = true;
            due.isPartial = false;
            due.paidAt = bill.collectedAt;
            due.remainingAmount = 0;
        }

        const allPaid = loan.dues.every((d: Dues) => d.paid === true);

        if (allPaid) {
            loan.status = "REPAID";
        }

        await loan.save();
    }

    bill.status = "APPROVED";
    await bill.save();

    return NextResponse.json({ success: true });
}