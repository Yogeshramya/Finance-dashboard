import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Debit from "@/models/Debit";
import { getToken } from "next-auth/jwt";

const secret = process.env.NEXTAUTH_SECRET!;

export async function GET(req: NextRequest) {
    try {
        await connectDB();

        const token = await getToken({ req, secret });
        if (!token)
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const debits = await Debit.find({
            status: "PENDING",
            branch: token.branch,
        })
            .populate("employee")
            .sort({ createdAt: -1 })
            .lean();

        return NextResponse.json({ debits });
    } catch (error) {
        console.log(error);
        return NextResponse.json({ error: "Failed to fetch debits" }, { status: 500 });
    }
}
