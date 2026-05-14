import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Loan from "@/models/Loan";
import { getToken } from "next-auth/jwt";
import mongoose from "mongoose";

const secret = process.env.NEXTAUTH_SECRET!;

export async function GET(req: NextRequest) {
    try {
        await connectDB();

        const token = await getToken({ req, secret });

        if (!token || !token.branch) {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 401 }
            );
        }

        const now = new Date();

        const months: { key: string; label: string; amount: number }[] = [];

        // LAST 12 MONTHS
        for (let i = 11; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);

            const key = `${d.getFullYear()}-${d.getMonth() + 1}`;

            months.push({
                key,
                label: d.toLocaleString("en-IN", {
                    month: "short",
                    year: "numeric",
                }),
                amount: 0,
            });
        }

        const startDate = new Date(now.getFullYear(), now.getMonth() - 11, 1);

        const data = await Loan.aggregate([
            {
                $match: {
                    branch: new mongoose.Types.ObjectId(token.branch._id),
                    loanDate: { $gte: startDate },
                },
            },
            {
                $group: {
                    _id: {
                        year: { $year: "$loanDate" },
                        month: { $month: "$loanDate" },
                    },
                    total: { $sum: "$loanAmount" },
                },
            },
        ]);

        for (const item of data) {
            const key = `${item._id.year}-${item._id.month}`;
            const m = months.find((x) => x.key === key);
            if (m) m.amount = item.total;
        }

        return NextResponse.json({
            success: true,
            data: months.map((m) => ({
                month: m.label,
                amount: m.amount,
            })),
        });

    } catch (err) {
        console.error(err);

        return NextResponse.json(
            { success: false },
            { status: 500 }
        );
    }
}