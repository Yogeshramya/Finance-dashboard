import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import CreditModel from "@/models/Credit";
import Loan from "@/models/Loan";
import { Credit } from "@/types/credit";

interface CreditQuery {
    date?: { $gte: Date; $lt: Date };
    branch?: mongoose.Types.ObjectId;
    status?: "APPROVED";
}

export async function GET(request: NextRequest) {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const month = searchParams.get("month"); // YYYY-MM

    try {
        /* ---------------- AUTH ---------------- */
        const token = await getToken({
            req: request,
            secret: process.env.NEXTAUTH_SECRET,
        });

        if (!token) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        /* ---------------- DATE RANGE ---------------- */
        let start: Date | undefined;
        let end: Date | undefined;

        if (month) {
            start = new Date(`${month}-01`);
            end = new Date(start);
            end.setMonth(end.getMonth() + 1);
        }

        /* ---------------- CREDIT QUERY ---------------- */
        const creditQuery: CreditQuery = {
            status: "APPROVED",
        };

        if (token.branch?._id) {
            creditQuery.branch = new mongoose.Types.ObjectId(token.branch._id);
        }

        if (start && end) {
            creditQuery.date = { $gte: start, $lt: end };
        }

        const credits = await CreditModel.find(creditQuery).sort({ date: -1 });

        const creditTotal = credits.reduce(
            (sum: number, c: Credit) => sum + (c.amount || 0),
            0
        );

        /* ---------------- DUES PAID AGGREGATION ---------------- */
        const duesPaidAgg = await Loan.aggregate([
            {
                $match: {
                    ...(token.branch?._id && {
                        branch: new mongoose.Types.ObjectId(token.branch._id),
                    }),
                    ...(start && end && {
                        loanDate: { $gte: start, $lt: end },
                    }),
                    status: { $in: ["APPROVED", "REPAID"] },
                },
            },
            { $unwind: "$dues" },
            {
                $match: {
                    "dues.paid": true,
                },
            },
            {
                $group: {
                    _id: null,
                    totalPaid: { $sum: "$dues.total" },
                },
            },
        ]);

        const duesPaidTotal = duesPaidAgg[0]?.totalPaid || 0;

        /* ---------------- RESPONSE ---------------- */
        return NextResponse.json({
            success: true,

            credits,
            creditCount: credits.length,
            creditTotal,

            duesPaidTotal,

            grandTotal: creditTotal + duesPaidTotal,
        });
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            {
                success: false,
                error: "Failed to fetch fund report",
            },
            { status: 500 }
        );
    }
}
