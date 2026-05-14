import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { connectDB } from "@/lib/db";
import Bill from "@/models/Bill";
import Credit from "@/models/Credit";
import Debit from "@/models/Debit";
import CashBox from "@/models/CashBox";
import mongoose from "mongoose";
import DaySheetDraft from "@/models/DaySheetDraft";

interface Denoms {
    note: number;
    count: number;
    total: number;
}

const secret = process.env.NEXTAUTH_SECRET!;

export async function GET(req: NextRequest) {
    try {
        await connectDB();
        const token = await getToken({ req, secret });

        if (!token?.branch) {
            return NextResponse.json(
                { success: false, error: "Unauthorized" },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(req.url);
        const today = searchParams.get("today");
        let from = searchParams.get("from");
        let to = searchParams.get("to");

        if (today === "true") {
            const now = new Date();
            from = now.toISOString().slice(0, 10);
            to = from;
        }

        if (!from || !to) {
            return NextResponse.json(
                { success: false, error: "From & To dates required" },
                { status: 400 }
            );
        }

        const startDate = new Date(from);
        startDate.setUTCHours(0, 0, 0, 0);

        const endDate = new Date(to);
        endDate.setUTCHours(23, 59, 59, 999);

        const branchId =
            typeof token.branch === "string"
                ? token.branch
                : token.branch?._id;

        const branchObjectId = new mongoose.Types.ObjectId(branchId);

        /* =======================
           Check CashBox Today
        ======================= */
        const cashBoxToday = await CashBox.findOne({
            branch: branchObjectId,
            date: { $gte: startDate, $lte: endDate },
        })
            .sort({ date: -1 })
            .lean();

        const cashBoxStatus = cashBoxToday?.status || "OPEN";

        /* =======================
            Bill Collection (Income)
        ======================= */
        const billAgg = await Bill.aggregate([
            {
                $match: {
                    branch: branchObjectId,
                    status: "APPROVED",
                    collectedAt: { $gte: startDate, $lte: endDate },
                },
            },
            { $unwind: "$loans" },
            {
                $group: {
                    _id: null,
                    principal: { $sum: "$loans.principal" },
                    interest: { $sum: "$loans.interest" },
                    savings: { $sum: "$loans.savings" },
                },
            },
        ]);

        const principal = billAgg[0]?.principal ?? 0;
        const interest = billAgg[0]?.interest ?? 0;
        const savings = billAgg[0]?.savings ?? 0;

        /* =======================
           Credit (Income)
        ======================= */
        const creditAgg = await Credit.aggregate([
            {
                $match: {
                    branch: branchObjectId,
                    mode: "Cash",
                    status: "APPROVED",
                    date: { $gte: startDate, $lte: endDate },
                },
            },
            {
                $group: {
                    _id: "$title",
                    total: { $sum: "$amount" },
                },
            },
        ]);

        const creditTotal = creditAgg.reduce((s, c) => s + c.total, 0);

        /* =======================
           Debit (Expense)
        ======================= */
        const debitAgg = await Debit.aggregate([
            {
                $match: {
                    branch: branchObjectId,
                    mode: "Cash",
                    status: "APPROVED",
                    date: { $gte: startDate, $lte: endDate },
                },
            },
            {
                $group: {
                    _id: "$title",
                    total: { $sum: "$amount" },
                },
            },
        ]);

        const debitTotal = debitAgg.reduce((s, d) => s + d.total, 0);

        /* =======================
            Denomination
        ======================= */

        let denominationAgg: Denoms[] = [];

        // First try approved cashbox
        denominationAgg = await CashBox.aggregate([
            {
                $match: {
                    branch: branchObjectId,
                    status: "APPROVED",
                    date: { $gte: startDate, $lte: endDate },
                },
            },
            { $unwind: "$denomination" },
            {
                $group: {
                    _id: "$denomination.note",
                    count: { $sum: "$denomination.count" },
                    total: { $sum: "$denomination.total" },
                },
            },
            {
                $project: {
                    _id: 0,
                    note: "$_id",
                    count: 1,
                    total: 1,
                },
            },
            { $sort: { note: -1 } },
        ]);

        // If no approved cashbox → check draft
        if (denominationAgg.length === 0) {

            const draft = await DaySheetDraft.findOne({
                branch: branchObjectId,
                date: from,
            }).lean();

            if (draft?.denomination?.length) {

                denominationAgg = draft.denomination.map((d: Denoms) => ({
                    note: d.note,
                    count: d.count,
                    total: d.total,
                }));
            }
        }

        /* =======================
           Totals
        ======================= */
        const totalIncome = principal + interest + savings + creditTotal;
        const totalExpense = debitTotal;

        /* =======================
           Opening & Closing Balance
        ======================= */
        let openingBalance = 0;
        let closingBalance = 0;

        if (cashBoxToday) {
            // If cashbox already exists, use stored values
            openingBalance = cashBoxToday.openingBalance || 0;
            closingBalance = cashBoxToday.closingBalance || 0;
        } else {
            // If cashbox not created, calculate using last approved closing
            const openingCash = await CashBox.findOne({
                branch: branchObjectId,
                date: { $lt: startDate },
                status: "APPROVED",
            })
                .sort({ date: -1 })
                .lean();

            openingBalance = openingCash?.closingBalance || 0;
            closingBalance = openingBalance + totalIncome - totalExpense;
        }

        /* =======================
           Response
        ======================= */
        return NextResponse.json({
            success: true,
            report: {
                from,
                to,
                openingBalance,
                closingBalance,
                totalIncome,
                totalExpense,
                cashBoxStatus,
                income: [
                    { _id: "Loan Principal", total: principal },
                    { _id: "Loan Interest", total: interest },
                    { _id: "Savings", total: savings },
                    ...creditAgg,
                ],
                expenses: debitAgg,
                denomination: denominationAgg,
            },
        });
    } catch (error) {
        console.error("Summary Report Error:", error);
        return NextResponse.json(
            { success: false, error: "Server error" },
            { status: 500 }
        );
    }
}
