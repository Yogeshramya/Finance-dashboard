import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Loan from "@/models/Loan";
import SavingsDraft from "@/models/SavingsDraft";
import { Dues } from "@/types/fund";

export async function GET(req: NextRequest) {
    try {
        await connectDB();

        const { searchParams } = new URL(req.url);
        const clientId = searchParams.get("clientId");

        if (!clientId) {
            return NextResponse.json(
                { success: false, error: "clientId is required" },
                { status: 400 }
            );
        }

        /* ================= GET LOANS ================= */

        const loans = await Loan.find({
            customer: clientId,
            $or: [
                { savingsRefunded: { $exists: false } },
                { savingsRefunded: false },
            ],
        }).lean();

        /* ================= PAID SAVINGS ================= */

        let paidSavings = 0;

        for (const loan of loans) {
            const loanPaidSavings = (loan.dues || [])
                .filter((d: Dues) => d.paid === true)
                .reduce(
                    (sum: number, d: Dues) => sum + Number(d.savings || 0),
                    0
                );

            paidSavings += loanPaidSavings;
        }

        /* ================= DRAFT SAVINGS ================= */

        const draft = await SavingsDraft.findOne({ customerId: clientId }).lean();

        const draftSavings = Number(draft?.totalSavings || 0);

        /* ================= RESPONSE ================= */

        return NextResponse.json({
            success: true,
            paidSavings,
            draftSavings,
            totalSavings: paidSavings + draftSavings,
            loanCount: loans.length,
        });

    } catch (err) {
        console.log(err);

        return NextResponse.json(
            { success: false, error: "Server error" },
            { status: 500 }
        );
    }
}