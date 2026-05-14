import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { connectDB } from "@/lib/db";
import Bill from "@/models/Bill";
import User from "@/models/User";
import Group from "@/models/Group";

const secret = process.env.NEXTAUTH_SECRET!;

interface Query {
    branch: string;
    employee?: string;
    group?: string;
    weekNo?: number;
    type?: string;
    collectedAt?: { $gte?: Date; $lte?: Date };
}
export async function GET(req: NextRequest) {
    try {
        await connectDB();

        const token = await getToken({ req, secret });
        if (!token) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);

        const employeeId = searchParams.get("employeeId"); // optional
        const groupId = searchParams.get("groupId");       // optional
        const weekNo = searchParams.get("weekNo");         // optional
        const type = searchParams.get("type");             // "Normal" | "PreClose" optional
        const today = searchParams.get("today");           // "true" optional
        const from = searchParams.get("from");             // "YYYY-MM-DD"
        const to = searchParams.get("to");                 // "YYYY-MM-DD"

        const query: Query = {
            branch: token.branch?._id ?? "",        // branch restricted
        };

        if (employeeId) query.employee = employeeId;
        if (groupId) query.group = groupId;
        if (weekNo) query.weekNo = Number(weekNo);
        if (type) query.type = type;

        // Today filter (on collectedAt)
        if (today === "true") {
            const start = new Date();
            start.setUTCHours(0, 0, 0, 0);
            const end = new Date();
            end.setUTCHours(23, 59, 59, 999);
            query.collectedAt = { $gte: start, $lte: end };
        }

        // Date range filter (on collectedAt)
        if (from && to) {
            const startDate = new Date(from);
            const endDate = new Date(to);
            endDate.setUTCHours(23, 59, 59, 999);
            query.collectedAt = { $gte: startDate, $lte: endDate };
        }

        const bills = await Bill.find(query)
            .populate([
                { path: "employee", select: "name", model: User },
                { path: "group", select: "groupName groupId", model: Group },
            ])
            .sort({ collectedAt: -1 });

        return NextResponse.json({
            success: true,
            count: bills.length,
            bills,
        });
    } catch (error) {
        console.error("Bill fetch error:", error);
        return NextResponse.json(
            { success: false, error: error },
            { status: 500 }
        );
    }
}
