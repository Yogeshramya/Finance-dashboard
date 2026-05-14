import { NextResponse } from "next/server";
import AuditLog from "@/models/AuditLog";
import { connectDB } from "@/lib/db";

export async function GET() {
    await connectDB();
    const logs = await AuditLog.find().sort({ timestamp: -1 }).limit(200);
    return NextResponse.json({ logs });
}
