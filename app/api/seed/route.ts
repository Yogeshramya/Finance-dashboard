import { NextRequest, NextResponse } from "next/server";
import { seedDemoData } from "@/lib/seed";

export async function POST(request: NextRequest) {
    try {
        await seedDemoData();
        return NextResponse.json({ success: true, message: "Demo data seeded successfully" });
    } catch (error) {
        console.error("Seed error:", error);
        return NextResponse.json({ success: false, error: "Failed to seed data" }, { status: 500 });
    }
}