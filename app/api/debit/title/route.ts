import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import DebitTitle from "@/models/DebitTitle";

export async function GET() {
    try {
        await connectDB();
        const titles = await DebitTitle.find().sort({ title: 1 });
        return NextResponse.json({ success: true, titles });
    } catch (error) {
        console.log("Error fetching debit titles:", error);
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

        const newTitle = await DebitTitle.create({ title: body.title });

        return NextResponse.json({ success: true, title: newTitle });
    } catch (error) {
        console.log("Error adding debit title:", error);
        return NextResponse.json({ success: false, error: "Failed to add title" });
    }
}
