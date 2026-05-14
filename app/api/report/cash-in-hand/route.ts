import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { connectDB } from "@/lib/db";
import Loan from "@/models/Loan";
import Credit from "@/models/Credit";
import Debit from "@/models/Debit";
import CashBox from "@/models/CashBox";

const secret = process.env.NEXTAUTH_SECRET!;

export async function GET(req: NextRequest) {
    try {
        await connectDB();
        const token = await getToken({ req, secret });

        if (!token?.branch) {
            return NextResponse.json(
                { success: false, error: "Branch missing" },
                { status: 401 }
            );
        }

        const branch = token.branch;

        // Today 0:00 → 23:59
        const startOfDay = new Date();
        startOfDay.setUTCHours(0, 0, 0, 0);

        const endOfDay = new Date();
        endOfDay.setUTCHours(23, 59, 59, 999);

        /* Fetch yesterday closing balance as opening */
        const yesterday = new Date(startOfDay);
        yesterday.setDate(yesterday.getDate() - 1);

        const prevCash = await CashBox.findOne({
            date: { $lte: yesterday },
            branch,
        }).sort({ date: -1 });

        const openingBalance = prevCash?.closingBalance || 0;

        /* Cash Income from Loan Dues Today */
        const duesAgg = await Loan.aggregate([
            { $match: { branch } },
            { $unwind: "$dues" },
            {
                $match: {
                    "dues.paid": true,
                    "dues.paidAt": { $gte: startOfDay, $lte: endOfDay }
                }
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: "$dues.total" }
                }
            }
        ]);
        const loanCollected = duesAgg[0]?.total || 0;

        /* Cash Credits Today */
        const creditAgg = await Credit.aggregate([
            {
                $match: {
                    branch,
                    mode: "Cash",
                    date: { $gte: startOfDay, $lte: endOfDay },
                }
            },
            { $group: { _id: null, total: { $sum: "$amount" } } }
        ]);
        const creditTotal = creditAgg[0]?.total || 0;

        /* Cash Debits Today */
        const debitAgg = await Debit.aggregate([
            {
                $match: {
                    branch,
                    mode: "Cash",
                    date: { $gte: startOfDay, $lte: endOfDay },
                }
            },
            { $group: { _id: null, total: { $sum: "$amount" } } }
        ]);
        const debitTotal = debitAgg[0]?.total || 0;

        const cashInHand = openingBalance + loanCollected + creditTotal - debitTotal;

        return NextResponse.json({
            success: true,
            data: {
                date: new Date().toISOString().split("T")[0],
                openingBalance,
                loanCollected,
                creditTotal,
                debitTotal,
                cashInHand,
            }
        });

    } catch (error) {
        console.error("Cash In Hand Error:", error);
        return NextResponse.json(
            { success: false, error: error },
            { status: 500 }
        );
    }
}
