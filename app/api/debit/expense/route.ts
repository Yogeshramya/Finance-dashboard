import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import db from "@/models/Debit";
import { connectDB } from "@/lib/db";
import { Debit } from "@/types/debit";

interface Query {
    date?: { $gte: Date; $lt: Date };
    branch?: string;
    status?: "APPROVED";
}

export async function GET(request: NextRequest) {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const month = searchParams.get("month");

    try {
        const query: Query = {
            status: "APPROVED", // ✅ ONLY approved debits
        };

        const token = await getToken({
            req: request,
            secret: process.env.NEXTAUTH_SECRET,
        });

        if (!token) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const branch = token.branch?._id;

        if (month) {
            const start = new Date(`${month}-01`);
            const end = new Date(start);
            end.setMonth(end.getMonth() + 1);
            query.date = { $gte: start, $lt: end };
        }

        if (branch) {
            query.branch = branch;
        }

        const debits = await db.find(query).sort({ date: -1 });

        return NextResponse.json({
            success: true,
            debits,
            count: debits.length,
            total: debits.reduce(
                (sum: number, d: Debit) => sum + d.amount,
                0
            ),
        });
    } catch (e) {
        console.log(e);
        return NextResponse.json(
            { success: false, error: "Failed to fetch debits" },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    await connectDB();

    try {
        const token = await getToken({
            req: request,
            secret: process.env.NEXTAUTH_SECRET,
        });

        if (!token) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();

        body.branch = token.branch?._id;
        body.employee = token.id;
        body.status = "PENDING"; // 🔒 always pending initially

        const newDebit = await db.create(body);

        return NextResponse.json({ success: true, debit: newDebit });
    } catch (e) {
        console.log(e);
        return NextResponse.json(
            { success: false, error: "Failed to create debit" },
            { status: 500 }
        );
    }
}
