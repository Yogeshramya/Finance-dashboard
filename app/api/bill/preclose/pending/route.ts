import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Bill from "@/models/Bill";
import { getToken } from "next-auth/jwt";

export async function GET(req: NextRequest) {
    try {
        await connectDB();

        const token = await getToken({
            req,
            secret: process.env.NEXTAUTH_SECRET,
        });

        if (!token) {
            return NextResponse.json(
                { success: false, error: "Unauthorized" },
                { status: 401 }
            );
        }

        const bills = await Bill.find({
            type: "PreClose",
            status: "APPROVAL",
            branch: token.branch?._id,
        })
            .populate("employee", "name")
            .populate("branch", "name")
            .populate("group", "groupName")
            .sort({ createdAt: -1 });

        return NextResponse.json({
            success: true,
            bills,
        });
    } catch (e) {
        console.error(e);
        return NextResponse.json(
            { success: false },
            { status: 500 }
        );
    }
}
