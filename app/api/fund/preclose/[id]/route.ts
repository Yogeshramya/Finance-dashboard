import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Loan from "@/models/Loan";
import Bill from "@/models/Bill";
import { getToken } from "next-auth/jwt";
import { Dues } from "@/types/fund";

export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectDB();

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

        const branchId = token.branch?._id;
        if (!branchId) {
            return NextResponse.json(
                { success: false, error: "Branch missing" },
                { status: 400 }
            );
        }

        const { id } = await params;
        const { amountPaid } = await req.json();

        const loan = await Loan.findById(id).populate("customer", "name");
        if (!loan)
            return NextResponse.json(
                { success: false, error: "Loan not found" },
                { status: 404 }
            );

        const pending = loan.dues.reduce(
            (acc: Dues, d: Dues) => {
                if (!d.paid) {
                    acc.principal += Number(d.principal || 0);
                    acc.interest += Number(d.interest || 0);
                    acc.savings += Number(d.savings || 0);
                    acc.total += Number(d.total || 0);
                    acc.count += 1;
                }
                return acc;
            },
            { principal: 0, interest: 0, savings: 0, total: 0, count: 0 }
        );

        if (amountPaid <= 0 || amountPaid > pending.total) {
            return NextResponse.json(
                {
                    success: false,
                    error: `Amount must be between 1 and ₹${pending.total}`,
                },
                { status: 400 }
            );
        }

        let remaining = amountPaid;
        let principalPaid = 0;
        let interestPaid = 0;
        let savingsPaid = 0;

        // Debit order: Principal → Interest → Savings
        if (remaining > 0) {
            principalPaid = Math.min(remaining, pending.principal);
            remaining -= principalPaid;
        }

        if (remaining > 0) {
            interestPaid = Math.min(remaining, pending.interest);
            remaining -= interestPaid;
        }

        if (remaining > 0) {
            savingsPaid = Math.min(remaining, pending.savings);
            remaining -= savingsPaid;
        }

        await Bill.create({
            employee: token.id,
            group: loan.group,
            branch: branchId,
            type: "PreClose",
            status: "APPROVAL",
            weekNo: pending.count,
            loans: [
                {
                    loanId: loan.mfLoanId,
                    customerName: loan.customer?.name || "Unknown",
                    paidAmount: amountPaid,
                    principal: principalPaid,
                    interest: interestPaid,
                    savings: savingsPaid,
                },
            ],
            totalMembers: 1,
            totalCollected: amountPaid,
            collectedAt: new Date(),
        });

        return NextResponse.json({
            success: true,
            message: "Pre-close request sent for approval",
        });
    } catch (e) {
        console.error(e);
        return NextResponse.json(
            { success: false, error: "Pre-close request failed" },
            { status: 500 }
        );
    }
}