import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Loan from "@/models/Loan";
import Branch from "@/models/Branch";
import mongoose from "mongoose";

interface BranchLoanRaw {
    _id: mongoose.Types.ObjectId;
    totalLoanAmount: number;
}

interface BranchLoanPopulated {
    _id: {
        _id: mongoose.Types.ObjectId;
        name: string;
    };
    totalLoanAmount: number;
}

export async function GET() {
    try {
        await connectDB();

        /* ---------------- TOTAL LOAN AMOUNT GIVEN ---------------- */
        const branchLoans: BranchLoanRaw[] = await Loan.aggregate([
            {
                $match: {
                    status: "APPROVED", // only approved loans
                    branch: { $ne: null }
                }
            },
            {
                $group: {
                    _id: "$branch",
                    totalLoanAmount: { $sum: "$loanAmount" }
                }
            },
            {
                $sort: { totalLoanAmount: -1 }
            },
            {
                $limit: 3
            }
        ]);

        /* ---------------- POPULATE BRANCH NAME ---------------- */
        await Branch.populate(branchLoans, {
            path: "_id",
            select: "name",
        });

        const populated = branchLoans as unknown as BranchLoanPopulated[];

        const topBranches = populated.map((b) => ({
            name: b._id?.name ?? "Unknown Branch",
            amount: b.totalLoanAmount,
        }));

        return NextResponse.json({
            success: true,
            data: topBranches,
        });
    } catch (error) {
        console.error("Top branches loan amount fetch error:", error);

        return NextResponse.json(
            { success: false, error: "Failed to fetch top branches" },
            { status: 500 }
        );
    }
}
