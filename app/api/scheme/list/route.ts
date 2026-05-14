import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Scheme from "@/models/Scheme";

export async function GET() {
    await connectDB();
    const data = await Scheme.find().sort({ schemeId: 1 });
    return NextResponse.json(data);
}
