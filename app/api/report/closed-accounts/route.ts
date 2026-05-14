import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { connectDB } from "@/lib/db";
import Loan from "@/models/Loan";

const secret = process.env.NEXTAUTH_SECRET!;

export async function GET(req: NextRequest) {
    try {
        await connectDB();
        const token = await getToken({ req, secret });

        if (!token?.branch) {
            return NextResponse.json({ success: false, error: "No branch" }, { status: 401 });
        }

        const loans = await Loan.find({
            branch: token.branch,
            status: "REPAID"
        })
            .populate("customer", "name phone")
            .populate("group", "groupName")
            .sort({ updatedAt: -1 });

        return NextResponse.json({ success: true, loans });

    } catch (err) {
        return NextResponse.json(
            { success: false, error: err },
            { status: 500 }
        );
    }
}
