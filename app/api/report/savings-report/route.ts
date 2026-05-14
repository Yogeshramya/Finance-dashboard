import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { connectDB } from "@/lib/db";
import Loan from "@/models/Loan";
import mongoose from "mongoose";

const secret = process.env.NEXTAUTH_SECRET!;
interface Filter {
    $gte?: Date;
    $lt?: Date;
}

interface Match {
    branch: mongoose.Types.ObjectId;
    updatedAt?: Filter;
    group?: mongoose.Types.ObjectId;
    employee?: mongoose.Types.ObjectId;
    savingsRefunded: { $in: boolean[] };
}

export async function GET(req: NextRequest) {
    try {
        await connectDB();

        /* ================= AUTH ================= */
        const token = await getToken({ req, secret });
        if (!token || !token.branch?._id) {
            return NextResponse.json(
                { success: false, error: "Unauthorized" },
                { status: 401 }
            );
        }

        const branchId = new mongoose.Types.ObjectId(token.branch._id);

        /* ================= QUERY PARAMS ================= */
        const { searchParams } = new URL(req.url);
        const from = searchParams.get("from");
        const to = searchParams.get("to");
        const group = searchParams.get("group");
        const employee = searchParams.get("employee");

        /* ================= DATE FILTER ================= */
        const dateFilter: Filter = {};
        if (from) {
            const d = new Date(from);
            d.setUTCHours(0, 0, 0, 0);
            dateFilter.$gte = d;
        }
        if (to) {
            const d = new Date(to);
            d.setUTCHours(0, 0, 0, 0);
            d.setDate(d.getDate() + 1);
            dateFilter.$lt = d;
        }

        /* ================= MATCH ================= */
        const match: Match = {
            branch: branchId,

            // handle missing field safely
            savingsRefunded: { $in: [true] },
        };

        if (Object.keys(dateFilter).length) {
            match.updatedAt = dateFilter;
        }

        if (group && group !== "ALL") {
            match.group = new mongoose.Types.ObjectId(group);
        }

        if (employee && employee !== "ALL") {
            match.employee = new mongoose.Types.ObjectId(employee);
        }

        /* ================= AGGREGATION ================= */
        const rows = await Loan.aggregate([
            { $match: match },

            { $unwind: "$dues" },

            /* COUNT ONLY PAID SAVINGS */
            {
                $match: {
                    "dues.paid": true,
                },
            },

            {
                $group: {
                    _id: "$_id",
                    mfLoanId: { $first: "$mfLoanId" },
                    loanAmount: { $first: "$loanAmount" },
                    customer: { $first: "$customer" },
                    group: { $first: "$group" },
                    employee: { $first: "$employee" },
                    refundedAt: { $first: "$updatedAt" },

                    totalSavings: { $sum: "$dues.savings" },
                },
            },

            /* ================= POPULATE ================= */
            {
                $lookup: {
                    from: "clients",
                    localField: "customer",
                    foreignField: "_id",
                    as: "customer",
                },
            },
            { $unwind: "$customer" },

            {
                $lookup: {
                    from: "groups",
                    localField: "group",
                    foreignField: "_id",
                    as: "group",
                },
            },
            { $unwind: "$group" },

            {
                $lookup: {
                    from: "users",
                    localField: "employee",
                    foreignField: "_id",
                    as: "employee",
                },
            },
            { $unwind: "$employee" },

            {
                $project: {
                    _id: 1,
                    mfLoanId: 1,
                    loanAmount: 1,
                    refundedAt: 1,
                    totalSavings: 1,

                    customerName: "$customer.name",
                    groupName: "$group.groupName",
                    groupId: "$group.groupId",
                    employeeName: "$employee.name",
                },
            },

            { $sort: { refundedAt: -1 } },
        ]);

        return NextResponse.json({
            success: true,
            rows,
        });
    } catch (error) {
        console.error("Savings refund report error:", error);
        return NextResponse.json(
            { success: false, error: "Failed to fetch savings refund report" },
            { status: 500 }
        );
    }
}
