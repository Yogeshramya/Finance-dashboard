import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Loan from "@/models/Loan";
import Debit from "@/models/Debit";
import Credit from "@/models/Credit";
import Scheme from "@/models/Scheme";
import User from "@/models/User";
import Group from "@/models/Group";
import Client from "@/models/Client";
const populateFields = [
    { path: "employee", select: "name", model: User },
    { path: "customer", select: "customerCode name phone", model: Client },
    { path: "scheme", select: "schemeName", model: Scheme },
    { path: "group", select: "_id groupName", model: Group },
];
export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    await connectDB();

    const { id } = await params;
    const { remarks, approvedBy } = await req.json();

    // Find loan
    const loan = await Loan.findById(id).populate(populateFields);
    if (!loan) {
        return NextResponse.json({ error: "Loan not found" }, { status: 404 });
    }

    if (loan.status === "APPROVED") {
        return NextResponse.json(
            { error: "Loan already approved" },
            { status: 400 }
        );
    }

    // Find scheme
    const scheme = await Scheme.findOne({
        _id: loan.scheme._id || loan.scheme
    });

    if (!scheme) {
        return NextResponse.json(
            { error: "Scheme not found" },
            { status: 404 }
        );
    }

    // Approve loan
    loan.status = "APPROVED";
    loan.approvalRemarks = remarks;
    loan.approvedAt = new Date();
    await loan.save();

    // Debit: Loan Disbursement
    const debit = await Debit.create({
        date: new Date(),
        title: "Loan Disbursement",
        details: `Loan disbursed for Loan ID: ${loan._id}`,
        amount: loan.loanAmount,
        mode: "Cash",
        status: "APPROVED",
        approvedBy,
        approvedAt: new Date(),
        branch: loan.branch,
        employee: loan.employee,
    });

    const credits = [];

    // Credit: Application Fee
    if (scheme.applicationFees && scheme.applicationFees > 0) {
        credits.push(
            await Credit.create({
                date: new Date(),
                title: "Application Fee",
                details: `Application fee for Loan ID: ${loan._id}`,
                amount: scheme.applicationFees,
                mode: "Cash",
                status: "APPROVED",
                approvedBy,
                approvedAt: new Date(),
                branch: loan.branch,
                employee: loan.employee,
            })
        );
    }

    // Credit: Insurance Fee
    if (scheme.insuranceFees && scheme.insuranceFees > 0) {
        credits.push(
            await Credit.create({
                date: new Date(),
                title: "Insurance Fee",
                details: `Insurance fee for Loan ID: ${loan._id}`,
                amount: scheme.insuranceFees,
                mode: "Cash",
                status: "APPROVED",
                approvedBy,
                approvedAt: new Date(),
                branch: loan.branch,
                employee: loan.employee,
            })
        );
    }

    return NextResponse.json({
        success: true,
        loan,
        debit,
        credits,
    });
}
