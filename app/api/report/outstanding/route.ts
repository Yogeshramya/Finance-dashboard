import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import Loan from "@/models/Loan";

const secret = process.env.NEXTAUTH_SECRET!;

export async function GET(req: NextRequest) {
    try {
        await connectDB();

        /* AUTH */
        const token = await getToken({ req, secret });

        if (!token || !token.branch?._id) {
            return NextResponse.json(
                { success: false, error: "Unauthorized" },
                { status: 401 }
            );
        }

        const branchId = new mongoose.Types.ObjectId(token.branch._id);

        /* FILTER PARAMS */
        const groupId = req.nextUrl.searchParams.get("group");

        const match: {
            branch?: mongoose.Types.ObjectId;
            status?: { $in: string[] };
            group?: mongoose.Types.ObjectId;
        } = {
            branch: branchId,
            status: { $in: ["APPROVED", "REPAID"] },
        };

        if (groupId && mongoose.Types.ObjectId.isValid(groupId)) {
            match.group = new mongoose.Types.ObjectId(groupId);
        }

        const rows = await Loan.aggregate([
            /* FILTER LOANS */
            {
                $match: match,
            },

            /* LOOKUP CLIENT */
            {
                $lookup: {
                    from: "clients",
                    localField: "customer",
                    foreignField: "_id",
                    as: "client",
                },
            },

            { $unwind: "$client" },

            /* REMOVE CLOSED CLIENTS */
            {
                $match: {
                    "client.status": { $ne: "CLOSED" },
                },
            },

            /* UNWIND DUES */
            { $unwind: "$dues" },

            /* GROUP PER LOAN */
            {
                $group: {
                    _id: {
                        loanId: "$_id",
                        group: "$group",
                    },

                    loanAmount: { $first: "$loanAmount" },

                    totalPrincipal: { $sum: "$dues.principal" },

                    paidPrincipal: {
                        $sum: {
                            $cond: ["$dues.paid", "$dues.principal", 0],
                        },
                    },

                    totalInterest: { $sum: "$dues.interest" },

                    paidInterest: {
                        $sum: {
                            $cond: ["$dues.paid", "$dues.interest", 0],
                        },
                    },

                    paidSavings: {
                        $sum: {
                            $cond: ["$dues.paid", "$dues.savings", 0],
                        },
                    },

                    members: { $addToSet: "$customer" },
                },
            },

            /* GROUP PER GROUP */
            {
                $group: {
                    _id: "$_id.group",

                    loanAmount: { $sum: "$loanAmount" },

                    totalPrincipal: { $sum: "$totalPrincipal" },
                    paidPrincipal: { $sum: "$paidPrincipal" },

                    totalInterest: { $sum: "$totalInterest" },
                    paidInterest: { $sum: "$paidInterest" },

                    paidSavings: { $sum: "$paidSavings" },

                    members: { $addToSet: "$members" },
                },
            },

            /* LOOKUP GROUP */
            {
                $lookup: {
                    from: "groups",
                    localField: "_id",
                    foreignField: "_id",
                    as: "group",
                },
            },

            { $unwind: "$group" },

            /* FINAL RESULT */
            {
                $project: {
                    _id: 0,

                    groupName: "$group.groupName",

                    members: {
                        $size: {
                            $reduce: {
                                input: "$members",
                                initialValue: [],
                                in: {
                                    $setUnion: ["$$value", "$$this"],
                                },
                            },
                        },
                    },

                    loanAmount: 1,

                    totalPrincipal: 1,
                    paidPrincipal: 1,

                    pendingPrincipal: {
                        $subtract: ["$totalPrincipal", "$paidPrincipal"],
                    },

                    totalInterest: 1,
                    paidInterest: 1,

                    pendingInterest: {
                        $subtract: ["$totalInterest", "$paidInterest"],
                    },

                    paidSavings: 1,

                    totalOutstanding: {
                        $add: [
                            { $subtract: ["$totalPrincipal", "$paidPrincipal"] },
                            { $subtract: ["$totalInterest", "$paidInterest"] },
                        ],
                    },

                    status: {
                        $cond: [
                            { $eq: ["$group.status", "CLOSED"] },
                            "CLOSED",
                            "ACTIVE",
                        ],
                    },
                },
            },

            { $sort: { groupName: 1 } },
        ]);

        return NextResponse.json({
            success: true,
            rows,
        });

    } catch (error) {
        console.error("Group financial summary error:", error);

        return NextResponse.json(
            { success: false, error: "Failed to fetch report" },
            { status: 500 }
        );
    }
}