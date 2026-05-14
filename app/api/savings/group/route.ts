import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Client from "@/models/Client";
import Loan from "@/models/Loan";
import SavingsDraft from "@/models/SavingsDraft";
import { Dues } from "@/types/fund";

export async function GET(req: NextRequest) {

    try {

        await connectDB();

        const groupId = req.nextUrl.searchParams.get("groupId");

        if (!groupId) {
            return NextResponse.json({
                success: false,
                error: "groupId required",
            });
        }

        /* ===== GET CLIENTS ===== */

        const clients = await Client.find({ group: groupId }).lean();

        const results = [];

        for (const client of clients) {

            /* ===== FIND ACTIVE LOAN (NOT REFUNDED) ===== */

            const loan = await Loan.findOne({
                customer: client._id,
                savingsRefunded: { $ne: true },
            })
                .sort({ createdAt: -1 })
                .lean();

            let loanSavings = 0;

            if (loan?.dues?.length) {

                loanSavings = loan.dues.reduce((sum: number, d: Dues) => {

                    const s = Number(d.savingsPaid ?? d.savings ?? 0);

                    return sum + (d.paid ? s : 0);

                }, 0);

            }

            /* ===== FIND SAVINGS DRAFT ===== */

            const draft = await SavingsDraft.findOne({
                customerId: client._id
            }).lean();

            const draftSavings = draft?.totalSavings || 0;

            const totalSavings = loanSavings + draftSavings;

            /* ===== SKIP IF NO SAVINGS ===== */

            if (totalSavings <= 0) continue;

            results.push({

                customerId: client._id,

                name: client.name,
                phone: client.phone,

                loanId: loan?._id || null,
                loanStatus: loan?.status || null,

                loanSavings,
                draftSavings,
                totalSavings,

                savingsRequested: loan?.savingsRequested || false,
                savingsReturned: loan?.savingsReturned || false,

                refunded: draft?.refunded || false,

            });

        }

        return NextResponse.json({
            success: true,
            customers: results,
        });

    } catch (err) {

        console.error(err);

        return NextResponse.json({
            success: false,
            error: "Server error",
        });

    }
}