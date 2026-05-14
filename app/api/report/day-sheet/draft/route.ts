import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getToken } from "next-auth/jwt";
import DaySheetDraft from "@/models/DaySheetDraft";

const secret = process.env.NEXTAUTH_SECRET!;

export async function GET(req: NextRequest) {
    await connectDB();

    const token = await getToken({ req, secret });
    if (!token)
        return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const today = new Date().toISOString().slice(0, 10);

    const draft = await DaySheetDraft.findOne({
        date: today,
        branch: token.branch?._id,
    }).lean();

    return NextResponse.json({
        success: true,
        draft,
    });
}
