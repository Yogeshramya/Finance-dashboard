import { connectDB } from "@/lib/db";
import Expense from "@/models/Expense";
import { NextResponse } from "next/server";

export async function GET() {
    await connectDB();
    const expenses = await Expense.find().populate("userId");
    return NextResponse.json(expenses);
}

export async function POST(req: Request) {
    const body = await req.json();
    await connectDB();
    const expense = await Expense.create(body);
    return NextResponse.json(expense);
}
