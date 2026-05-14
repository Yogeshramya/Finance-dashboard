import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Loan from "@/models/Loan";
import User from "@/models/User";
import Client from "@/models/Client";
import Scheme from "@/models/Scheme";
import Group from "@/models/Group";
import SavingsDraft from "@/models/SavingsDraft";
import SavingsApproval from "@/models/Savings"; // NEW
import { Dues } from "@/types/fund";

/* ---------------- POPULATE ---------------- */

const populateFields = [
    { path: "employee", select: "name", model: User },
    { path: "customer", select: "customerCode name phone", model: Client },
    { path: "scheme", select: "schemeName", model: Scheme },
    { path: "group", select: "_id groupName", model: Group },
];

export async function GET(req: Request) {

    await connectDB();

    const { searchParams } = new URL(req.url);
    const customerId = searchParams.get("customerId");

    if (!customerId)
        return NextResponse.json(
            { error: "customerId required" },
            { status: 400 }
        );

    /* ---------------- ALL LOANS ---------------- */

    const loans = await Loan.find({
        customer: customerId,
        status: { $in: ["APPROVED", "REPAID"] },
    })
        .populate(populateFields)
        .sort({ createdAt: -1 })
        .lean();

    /* ---------------- LATEST LOAN (FOR UI) ---------------- */

    const latestLoan = loans.length > 0 ? loans[0] : null;

    /* ---------------- LOAN SAVINGS ---------------- */

    let loanSavings = 0;

    for (const loan of loans) {

        if (!loan?.dues?.length) continue;

        loanSavings += loan.dues.reduce((sum: number, d: Dues) => {

            const s = Number(d.savings ?? 0);

            return sum + (d.paid ? s : 0);

        }, 0);
    }

    /* ---------------- SAVINGS DRAFT ---------------- */

    const draft = await SavingsDraft.findOne({ customerId }).lean();

    const draftSavings = draft?.totalSavings || 0;

    /* ---------------- TOTAL ---------------- */

    const totalSavings = loanSavings + draftSavings;

    /* ---------------- SAVINGS APPROVAL ---------------- */

    const approval = await SavingsApproval
        .findOne({ customer: customerId })
        .sort({ createdAt: -1 })
        .select("status")
        .lean();

    const approvalStatus = approval?.status || null;

    /* ---------------- RESPONSE ---------------- */

    return NextResponse.json({
        loan: latestLoan,
        loansCount: loans.length,
        loanSavings,
        draftSavings,
        totalSavings,
        draft,
        approvalStatus,
    });
}