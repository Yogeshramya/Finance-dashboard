import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Branch from "@/models/Branch";

export async function GET() {
    await connectDB();

    const branches = await Branch.find().lean();

    return NextResponse.json({ branches });
}