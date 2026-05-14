import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";

import Client from "@/models/Client";
import Loan from "@/models/Loan";
import SavingsDraft from "@/models/SavingsDraft";
import { Dues } from "@/types/fund";
import Savings from "@/models/Savings";

export async function GET(req: NextRequest) {
    try {
        await connectDB();

        const groupId = req.nextUrl.searchParams.get("groupId");

        if (!groupId) {
            return NextResponse.json(
                { success: false, error: "groupId required" },
                { status: 400 }
            );
        }

        /* ---------------- CLIENTS ---------------- */

        const clients = await Client.find({ group: groupId })
            .select("name phone")
            .lean();

        const results = [];

        for (const client of clients) {

            /* -------- GET ALL LOANS -------- */

            const loans = await Loan.find({
                customer: client._id,
                status: { $in: ["APPROVED", "REPAID"] },
            }).lean();

            let loanSavings = 0;

            for (const loan of loans) {
                if (!loan?.dues?.length) continue;

                loanSavings += loan.dues.reduce((sum: number, d: Dues) => {
                    const s = Number(d.savings ?? 0);
                    return sum + (d.paid ? s : 0);
                }, 0);
            }

            /* -------- FIND DRAFT -------- */

            const draft = await SavingsDraft.findOne({
                customerId: client._id,
            }).lean();

            const approval = await Savings
                .findOne({ customer: client._id })
                .sort({ createdAt: -1 })
                .select("status")
                .lean();

            let draftSavings = 0;

            if (draft?.entries?.length) {
                draftSavings = draft.entries.reduce(
                    (sum: number, e: { amount: number }) =>
                        sum + Number(e.amount || 0),
                    0
                );
            }

            /* -------- TOTAL -------- */

            const totalSavings = loanSavings + draftSavings;

            results.push({
                customerId: client._id,
                name: client.name,
                phone: client.phone,

                loans: loans.map(l => ({
                    loanId: l._id,
                    status: l.status
                })),

                loanSavings,
                draftSavings,
                totalSavings,

                savingsRequested: draft?.savingsRequested || false,
                savingsReturned: draft?.refunded || false,

                approvalStatus: approval?.status || null
            });
        }

        return NextResponse.json({
            success: true,
            customers: results,
        });

    } catch (err) {

        console.error("Clients savings API error:", err);

        return NextResponse.json({
            success: false,
            error: "Server error",
        });
    }
}