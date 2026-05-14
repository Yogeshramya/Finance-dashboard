import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
//import Loan from "@/models/Loan";
import Group from "@/models/Group";
import { getToken } from "next-auth/jwt";
import mongoose from "mongoose";

const secret = process.env.NEXTAUTH_SECRET!;

interface Filter {
    branch: mongoose.Types.ObjectId;
    status: string;
    employee?: mongoose.Types.ObjectId;
    _id?: mongoose.Types.ObjectId;
}

/* Get week range (Mon–Sun) */
function getWeekRange(from?: string, to?: string) {
    if (from || to) {
        const start = from ? new Date(from) : new Date("1970-01-01");
        const end = to ? new Date(to) : new Date();
        start.setUTCHours(0, 0, 0, 0);
        end.setUTCHours(23, 59, 59, 999);
        return { start, end };
    }

    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);

    const start = new Date(now.setDate(diff));
    start.setUTCHours(0, 0, 0, 0);

    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    end.setUTCHours(23, 59, 59, 999);

    return { start, end };
}

export async function GET(req: NextRequest) {
    try {
        await connectDB();

        /* 🔐 AUTH */
        const token = await getToken({ req, secret });
        if (!token || !token.branch) {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(req.url);

        const from = searchParams.get("from") || undefined;
        const to = searchParams.get("to") || undefined;
        const employee = searchParams.get("employee");
        const centre = searchParams.get("centre");

        const { start, end } = getWeekRange(from, to);

        /* GROUP FILTER */
        const groupMatch: Filter = {
            branch: new mongoose.Types.ObjectId(token.branch._id),
            status: "ACTIVE",
        };

        if (employee && employee !== "ALL") {
            groupMatch.employee = new mongoose.Types.ObjectId(employee);
        }

        if (centre && centre !== "ALL") {
            groupMatch._id = new mongoose.Types.ObjectId(centre);
        }

        /* 📊 AGGREGATION */
        const rows = await Group.aggregate([
            { $match: groupMatch },

            {
                $lookup: {
                    from: "loans",
                    localField: "_id",
                    foreignField: "group",
                    as: "loans",
                },
            },

            { $unwind: "$loans" },

            {
                $match: {
                    "loans.createdAt": { $gte: start, $lte: end },
                    "loans.status": { $ne: "REJECTED" },
                },
            },

            {
                $addFields: {
                    weeklyDue: {
                        $arrayElemAt: [
                            {
                                $filter: {
                                    input: "$loans.dues",
                                    as: "d",
                                    cond: { $eq: ["$$d.paid", false] },
                                },
                            },
                            0,
                        ],
                    },
                },
            },

            {
                $group: {
                    _id: "$_id",

                    centreDay: { $first: "$collectionDay" },
                    centreName: { $first: "$groupName" },
                    centreTime: { $first: "$collectionTime" },
                    staffName: { $first: "$employee" },
                    branch: { $first: "$branch" },

                    totalMembers: { $first: "$totalMembers" },

                    principal: { $sum: { $ifNull: ["$weeklyDue.principal", 0] } },
                    interest: { $sum: { $ifNull: ["$weeklyDue.interest", 0] } },
                    savings: { $sum: { $ifNull: ["$weeklyDue.savings", 0] } },

                    collectedAmount: {
                        $sum: {
                            $sum: "$loans.collections.amount",
                        },
                    },
                },
            },

            {
                $addFields: {
                    totalAmount: {
                        $add: ["$principal", "$interest", "$savings"],
                    },
                },
            },

            { $sort: { centreName: 1 } },
        ]);

        /* 🧮 GRAND TOTALS */
        const totals = rows.reduce(
            (a, r) => {
                a.members += r.totalMembers || 0;
                a.principal += r.principal || 0;
                a.interest += r.interest || 0;
                a.savings += r.savings || 0;
                a.total += r.totalAmount || 0;
                a.collected += r.collectedAmount || 0;
                return a;
            },
            {
                members: 0,
                principal: 0,
                interest: 0,
                savings: 0,
                total: 0,
                collected: 0,
            }
        );

        return NextResponse.json({
            success: true,
            from: start.toISOString().slice(0, 10),
            to: end.toISOString().slice(0, 10),
            rows,
            totals,
        });
    } catch (err) {
        console.error(err);
        return NextResponse.json(
            { success: false, message: "Server error" },
            { status: 500 }
        );
    }
}
