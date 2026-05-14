import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { connectDB } from "@/lib/db";
import DaySheetDraft from "@/models/DaySheetDraft";

const secret = process.env.NEXTAUTH_SECRET!;

export async function POST(req: NextRequest) {
    try {
        await connectDB();
        const token = await getToken({ req, secret });

        if (!token)
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

        const { date, denomination } = await req.json();

        if (!date || !Array.isArray(denomination)) {
            return NextResponse.json(
                { success: false, error: "Invalid payload" },
                { status: 400 }
            );
        }

        await DaySheetDraft.findOneAndUpdate(
            { date, branch: token.branch },
            {
                date,
                branch: token.branch,
                employee: token.id,
                denomination,
            },
            {
                upsert: true,
                returnDocument: 'after',
            }
        );

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("DaySheet Save Error:", error);
        return NextResponse.json(
            { success: false, error: "Server error" },
            { status: 500 }
        );
    }
}
