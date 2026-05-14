import { connectDB } from "@/lib/db";
import Loan from "@/models/Loan";
import { NextResponse } from "next/server";

export async function GET() {
    await connectDB();
    const loans = await Loan.find().populate("userId");
    return NextResponse.json(loans);
}

export async function POST(req: Request) {
    const body = await req.json();
    await connectDB();
    const loan = await Loan.create(body);
    return NextResponse.json(loan);
}
