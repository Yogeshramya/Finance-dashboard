import { connectDB } from "@/lib/db";
import CashBox from "@/models/CashBox";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        await connectDB();

        const cashboxes = await CashBox.find({
            status: "APPROVED"
        })
            .sort({ date: -1 })   // latest first
            .limit(5)
            .lean();

        return NextResponse.json({
            success: true,
            cashboxes
        });
    } catch (error) {
        console.error("Approved cashbox fetch error:", error);
        return NextResponse.json(
            { success: false, error: "Server error" },
            { status: 500 }
        );
    }
}
