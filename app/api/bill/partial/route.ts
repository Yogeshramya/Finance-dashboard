import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { connectDB } from "@/lib/db";
import Bill from "@/models/Bill";
import Loan from "@/models/Loan";
import Groupdb from "@/models/Group";
import { Dues } from "@/types/fund";

const secret = process.env.NEXTAUTH_SECRET!;
const safe = (v: number) => Number(v) || 0;

export async function POST(req: NextRequest) {
    try {
        await connectDB();

        const token = await getToken({ req, secret });
        if (!token)
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );

        const { loanId, weekNo, paidAmount, customerName } = await req.json();

        if (!loanId || !paidAmount || !weekNo)
            return NextResponse.json(
                { error: "Invalid data" },
                { status: 400 }
            );

        const loan = await Loan.findById(loanId);
        if (!loan)
            return NextResponse.json(
                { error: "Loan not found" },
                { status: 404 }
            );

        const group = await Groupdb.findById(loan.group);
        if (!group)
            return NextResponse.json(
                { error: "Group not found" },
                { status: 404 }
            );

        const dueIndex = weekNo - 1;
        const due: Dues = loan.dues[dueIndex];

        if (!due)
            return NextResponse.json(
                { error: "Due not found" },
                { status: 400 }
            );

        let payment = safe(paidAmount);

        /* ================= CALCULATE REMAINING ================= */

        const principalRemaining =
            safe(due.principal) - safe(due.principalPaid);

        const interestRemaining =
            safe(due.interest) - safe(due.interestPaid);

        const savingsRemaining =
            safe(due.savings) - safe(due.savingsPaid);

        const maxAllowed =
            principalRemaining +
            interestRemaining +
            savingsRemaining;

        payment = Math.min(payment, maxAllowed);

        /* ================= DISTRIBUTION ================= */
        const principalPay = Math.min(payment, principalRemaining);
        payment -= principalPay;

        const interestPay = Math.min(payment, interestRemaining);
        payment -= interestPay;

        const savingsPay = Math.min(payment, savingsRemaining);

        /* ================= UPDATE DUE ================= */

        due.principalPaid = safe(due.principalPaid) + principalPay;
        due.interestPaid = safe(due.interestPaid) + interestPay;
        due.savingsPaid = safe(due.savingsPaid) + savingsPay;

        due.paidAmount = safe(due.paidAmount) + safe(paidAmount);

        const remaining =
            (safe(due.principal) - due.principalPaid) +
            (safe(due.interest) - due.interestPaid) +
            (safe(due.savings) - due.savingsPaid);

        due.remainingAmount = remaining > 0 ? remaining : 0;

        const billTime = new Date();

        if (due.remainingAmount === 0) {
            due.paid = true;
            due.isPartial = false;
            due.paidAt = billTime.toISOString();
        } else {
            due.paid = true;
            due.isPartial = true;
            //loan.status = "ARREAR";
        }

        /* ================= PUSH COLLECTION ================= */

        loan.collections.push({
            weekNo,
            amount: paidAmount,
            collectedAt: billTime,
        });

        /* ================= CHECK FULL LOAN CLOSE ================= */

        const allPaid = loan.dues.every((d: Dues) => d.paid);

        if (allPaid) {
            loan.status = "REPAID";
        }

        loan.markModified("dues");
        await loan.save();

        /* ================= CREATE BILL ================= */

        const bill = await Bill.create({
            employee: token.id,
            branch: token.branch?._id,
            group: loan.group,
            weekNo,
            type: "Partial",
            status: "APPROVED",
            loans: [
                {
                    loanId: loan.mfLoanId,
                    weekNo,
                    customerName: customerName,
                    paidAmount: paidAmount,
                    principal: principalPay,
                    interest: interestPay,
                    savings: savingsPay,
                },
            ],
            totalMembers: 1,
            totalCollected: paidAmount,
            collectedAt: billTime,
        });

        return NextResponse.json(
            { success: true, bill },
            { status: 201 }
        );
    } catch (error) {
        console.error("Partial Bill Error:", error);
        return NextResponse.json(
            { error: "Failed to save partial bill" },
            { status: 500 }
        );
    }
}