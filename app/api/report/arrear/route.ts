import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { connectDB } from "@/lib/db";
import ArrearLoan from "@/models/Arrear";

const secret = process.env.NEXTAUTH_SECRET!;

interface Filter {
    createdAt?: {
        $gte?: Date;
        $lte?: Date;
    };
    group?: string;
    branch?: string;
    status?: string;
}

export async function GET(req: NextRequest) {
    try {
        await connectDB();

        const token = await getToken({ req, secret });
        if (!token)
            return NextResponse.json({ success: false }, { status: 401 });

        const { searchParams } = new URL(req.url);

        const from = searchParams.get("from");
        const to = searchParams.get("to");
        const group = searchParams.get("group");
        const status = searchParams.get("status");

        const query: Filter = {
            branch: token.branch?._id
        };

        /* -------- DATE FILTER -------- */
        if (from || to) {
            query.createdAt = {};
            if (from) query.createdAt.$gte = new Date(from);
            if (to) query.createdAt.$lte = new Date(to);
        }

        /* -------- GROUP FILTER -------- */
        if (group && group !== "ALL") {
            query.group = group;
        }

        /* -------- STATUS FILTER -------- */
        if (status && status !== "ALL") {
            query.status = status;
        }

        const arrears = await ArrearLoan.find(query)
            .populate("group", "groupName")
            .populate("loan", "mfLoanId")
            .sort({ createdAt: -1 });

        return NextResponse.json({
            success: true,
            arrears,
        });
    } catch (err) {
        console.error("Arrear report error", err);
        return NextResponse.json(
            { success: false },
            { status: 500 }
        );
    }
}
