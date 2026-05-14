import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import CreditTitle from "@/models/CreditTitle";

export async function GET() {
    try {
        await connectDB();
        const titles = await CreditTitle.find().sort({ title: 1 });
        return NextResponse.json({ success: true, titles });
    } catch (error) {
        console.log("Error fetching credit titles:", error);
        return NextResponse.json({ success: false, error: "Failed to fetch titles" });
    }
}

export async function POST(req: NextRequest) {
    try {
        await connectDB();
        const body = await req.json();

        if (!body.title) {
            return NextResponse.json({ success: false, error: "Title required" });
        }

        const newTitle = await CreditTitle.create({ title: body.title });

        return NextResponse.json({ success: true, title: newTitle });
    } catch (error) {
        console.log("Error fetching credit titles:", error);
        return NextResponse.json({ success: false, error: "Failed to add title" });
    }
}
