import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Client from "@/models/Client";
import Group from "@/models/Group";
import Loan from "@/models/Loan";
import Scheme from "@/models/Scheme";
import User from "@/models/User";
import { getToken } from "next-auth/jwt";
import { Loan as LoanType } from "@/types/fund";

const secret = process.env.NEXTAUTH_SECRET!;

export async function GET(req: NextRequest) {
    try {
        await connectDB();

        const token = await getToken({ req, secret });
        if (!token)
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { searchParams } = new URL(req.url);
        const from = searchParams.get("from");
        const to = searchParams.get("to");

        if (!from || !to) {
            return NextResponse.json(
                { success: false, error: "From & To required" },
                { status: 400 }
            );
        }

        const fromDate = new Date(from);
        const toDate = new Date(to);
        toDate.setUTCHours(23, 59, 59, 999);

        /* 1️⃣ Fetch clients */
        const clients = await Client.find({
            createdAt: { $gte: fromDate, $lte: toDate },
            branch: token.branch?._id,
        })
            .populate({
                path: "group",
                select: "groupName employee createdBy",
                model: Group,
                populate: [
                    {
                        path: "employee",
                        select: "name",
                        model: User,
                    },
                    {
                        path: "createdBy",
                        select: "name",
                        model: User,
                    },
                ],
            })
            .lean();

        if (clients.length === 0) {
            return NextResponse.json({ success: true, clients: [] });
        }

        const clientIds = clients.map(c => c._id);

        const loans = await Loan.find({
            customer: { $in: clientIds },
        })
            .populate({
                path: "scheme",
                select: "schemeName",
                model: Scheme,
            })
            .lean();

        const loanMap = new Map<string, LoanType>();
        loans.forEach(l => {
            loanMap.set(String(l.customer), l);
        });

        const result = clients.map(c => {
            const loan = loanMap.get(String(c._id));

            return {
                ...c,
                scheme: loan?.scheme || null,
                collectionEmployee: c.group?.employee || null,
                createdEmployee: c.group?.createdBy || null,
            };
        });

        return NextResponse.json({
            success: true,
            clients: result,
        });

    } catch (error) {
        console.error("Disposal report error:", error);
        return NextResponse.json(
            { success: false, error: "Server error" },
            { status: 500 }
        );
    }
}
