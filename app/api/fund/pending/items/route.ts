import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import LoanModel from "@/models/Loan";
import Client from "@/models/Client";
import { getToken } from "next-auth/jwt";
import { Dues, Loan } from "@/types/fund";

const secret = process.env.NEXTAUTH_SECRET!;

export async function GET(req: NextRequest) {
    try {
        await connectDB();

        const token = await getToken({ req, secret });
        if (!token || !token.branch)
            return NextResponse.json(
                { success: false, error: "Unauthorized" },
                { status: 401 }
            );

        const { searchParams } = new URL(req.url);
        const customerId = searchParams.get("customerId");

        if (!customerId) {
            return NextResponse.json(
                { success: false, error: "customerId required" },
                { status: 400 }
            );
        }

        // Active loan for customer in same branch
        const loan = await LoanModel.findOne({
            customer: customerId,
            branch: token.branch,
            status: { $ne: "REPAID" },
        })
            .lean<Loan>()
            .exec();

        if (!loan) {
            return NextResponse.json(
                { success: false, error: "No active loan found" },
                { status: 404 }
            );
        }

        // Attach week numbers to dues
        const duesList: (Dues & { weekNo: number })[] = loan.dues.map((d, index) => ({
            ...d,
            weekNo: index + 1,
        }));

        const pendingDues = duesList.filter((d) => !d.paid);
        const paidDues = duesList.filter((d) => d.paid);

        // Auto-close loan if all dues cleared
        if (pendingDues.length === 0) {
            await LoanModel.findByIdAndUpdate(loan._id, { status: "REPAID" }).exec();

            return NextResponse.json({
                success: true,
                message: "Loan fully paid. Customer eligible for next loan.",
                data: {
                    customerId,
                    loan: {
                        _id: loan._id,
                        mfLoanId: loan.mfLoanId,
                        status: "REPAID",
                        loanAmount: loan.loanAmount,
                    },
                    pendingDues: [],
                    paidDues,
                },
            });
        }

        const customer = await Client.findById(customerId)
            .select("name phone customerCode")
            .lean()
            .exec();

        return NextResponse.json({
            success: true,
            data: {
                customer,
                loan: {
                    _id: loan._id,
                    mfLoanId: loan.mfLoanId,
                    status: loan.status,
                    loanAmount: loan.loanAmount,
                },
                pendingDues,
                paidDues,
            },
        });
    } catch (err) {
        console.error("Pending dues error:", err);
        return NextResponse.json(
            { success: false, error: (err as Error).message },
            { status: 500 }
        );
    }
}
