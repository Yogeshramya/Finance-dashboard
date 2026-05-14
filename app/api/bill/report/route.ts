import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { connectDB } from "@/lib/db";
import Bill from "@/models/Bill";

const secret = process.env.NEXTAUTH_SECRET!;

interface BillReportQuery {
    branch: {
        _id: string;
        name: string;
    };
    collectedAt?: {
        $gte?: Date;
        $lte?: Date;
    };
    group?: string;
    employee?: string;
    type?: string;
    status?: string;
}

export async function GET(req: NextRequest) {
    await connectDB();

    /* ---------- AUTH ---------- */
    const token = await getToken({ req, secret });

    if (!token || !token.branch) {
        return NextResponse.json(
            { success: false, error: "Unauthorized" },
            { status: 401 }
        );
    }

    const branch = token.branch;

    const { searchParams } = new URL(req.url);
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    const group = searchParams.get("group");
    const employee = searchParams.get("employee");
    const type = searchParams.get("type");
    /* ---------- BASE QUERY (branch enforced) ---------- */
    const query: BillReportQuery = {
        branch,
        status: "APPROVED",
    };

    if (type) {
        query.type = type || "Normal"; // "PreClose"
    }

    /* ---------- DATE FILTER ---------- */
    if (from || to) {
        query.collectedAt = {};

        if (from) {
            const fromDate = new Date(from);
            fromDate.setUTCHours(0, 0, 0, 0);
            query.collectedAt.$gte = fromDate;
        }

        if (to) {
            const toDate = new Date(to);
            toDate.setUTCHours(0, 0, 0, 0);
            toDate.setDate(toDate.getDate() + 1);
            query.collectedAt.$lte = toDate;
        }
    }

    /* ---------- GROUP FILTER ---------- */
    if (group && group !== "ALL") {
        query.group = group;
    }

    /* ---------- EMPLOYEE FILTER ---------- */
    if (employee && employee !== "ALL") {
        query.employee = employee;
    }

    const bills = await Bill.find(query)
        .populate("group", "groupName")
        .populate("employee", "name")
        .sort({ collectedAt: -1 });

    return NextResponse.json({
        success: true,
        bills,
    });
}
