import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import SavingsApproval from "@/models/Savings";
import SavingsDraft from "@/models/SavingsDraft";
import Debit from "@/models/Debit";
import Client from "@/models/Client";
import { getToken } from "next-auth/jwt";
import Loan from "@/models/Loan";

const secret = process.env.NEXTAUTH_SECRET!;

export async function POST(req: NextRequest) {
    try {
        await connectDB();

        const token = await getToken({ req, secret });

        if (!token)
            return NextResponse.json({ success: false }, { status: 401 });

        const { id } = await req.json();

        const approval = await SavingsApproval.findById(id);

        if (!approval || approval.status !== "PENDING") {
            return NextResponse.json({
                success: false,
                error: "Invalid approval",
            });
        }

        /* -------- APPROVE SAVINGS -------- */

        approval.status = "APPROVED";
        approval.approvedBy = token.id;
        approval.approvedAt = new Date();

        await approval.save();

        /* -------- MARK SAVINGS DRAFT RETURNED -------- */

        await SavingsDraft.findOneAndUpdate(
            { customerId: approval.customer },
            {
                refunded: true,
                savingsReturned: true,
            }
        );

        /* -------- UPDATE CLIENT -------- */

        await Client.findByIdAndUpdate(
            approval.customer,
            {
                refundSavings: true,
                status: "CLOSED",
            }
        );

        /* -------- UPDATE LOAN -------- */

        await Loan.updateMany(
            { customer: approval.customer },
            {
                savingsRefunded: true,
                status: "CLOSED",
            }
        );

        /* -------- CREATE DEBIT ENTRY -------- */

        const debit = await Debit.create({
            date: new Date(),
            title: "Savings Return",
            details: `Savings returned for customer ${approval.customer}`,
            amount: approval.savingsAmount,
            branch: token.branch?._id,
            mode: "Cash",
            status: "APPROVED",
            employee: token.id,
        });

        return NextResponse.json({
            success: true,
            debitId: debit._id,
        });

    } catch (err) {
        console.error(err);

        return NextResponse.json(
            {
                success: false,
                error: "Server error",
            },
            { status: 500 }
        );
    }
}