import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Client from "@/models/Client";
import { getToken } from "next-auth/jwt";
import Savings from "@/models/Savings";
import Loan from "@/models/Loan";
import Group from "@/models/Group";

const secret = process.env.NEXTAUTH_SECRET!;

export async function GET(req: NextRequest) {
    try {
        await connectDB();

        const token = await getToken({ req, secret });

        if (!token) {
            return NextResponse.json(
                { success: false },
                { status: 401 }
            );
        }

        /* ================= FETCH PENDING REQUESTS ================= */

        const records = await Savings.find({ status: "PENDING", branch: token.branch?._id })
            .populate({
                path: "customer",
                model: Client,
                select: "name phone",
            })
            .populate("requestedBy", "name")
            .populate("approvedBy", "name")
            .sort({ createdAt: -1 })
            .lean();

        /* ================= ATTACH LOAN + GROUP ================= */

        const enriched = await Promise.all(
            records.map(async (r) => {

                const loan = await Loan.findOne({ customer: r.customer?._id })
                    .populate({
                        path: "group",
                        model: Group,
                        select: "groupName groupId",
                    })
                    .select("mfLoanId group")
                    .lean();

                return {
                    ...r,
                    loan,
                };
            })
        );

        return NextResponse.json({
            success: true,
            records: enriched,
        });

    } catch (err) {

        console.error("Savings pending fetch error:", err);

        return NextResponse.json(
            { success: false, error: "Server error" },
            { status: 500 }
        );
    }
}