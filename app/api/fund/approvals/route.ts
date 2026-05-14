import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getToken } from "next-auth/jwt";

import Loan from "@/models/Loan";
import Client from "@/models/Client";
import Group from "@/models/Group";
import Scheme from "@/models/Scheme";
import User from "@/models/User";

const secret = process.env.NEXTAUTH_SECRET!;

const populateFields = [
    { path: "employee", select: "name", model: User },
    { path: "customer", select: "customerCode name phone", model: Client },
    { path: "scheme", select: "schemeName", model: Scheme },
    { path: "group", select: "_id groupName", model: Group },
];

export async function GET(req: NextRequest) {
    try {
        await connectDB();

        // Get token
        const token = await getToken({ req, secret });

        if (!token) {
            return NextResponse.json(
                { success: false, error: "Unauthorized" },
                { status: 401 }
            );
        }

        // Ensure branch exists
        const branchId = token.branch?._id;
        if (!branchId) {
            return NextResponse.json(
                { success: false, error: "Branch not assigned" },
                { status: 403 }
            );
        }

        // Fetch pending loans for branch
        const loans = await Loan.find({
            status: "PENDING",
            branch: branchId,
        })
            .sort({ createdAt: -1 })
            .populate(populateFields)
            .lean();

        return NextResponse.json({
            success: true,
            count: loans.length,
            loans,
        });
    } catch (error) {
        console.error("Pending Fund API Error:", error);
        return NextResponse.json(
            { success: false, message: "Failed to fetch pending funds" },
            { status: 500 }
        );
    }
}
