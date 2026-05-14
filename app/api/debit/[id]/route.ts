import { NextResponse } from "next/server";
import Debit from "@/models/Debit";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import Branch from "@/models/Branch";
const populateFields = [
    { path: "employee", select: "_id name", model: User },
    { path: "branch", select: "_id name code", model: Branch }
];
// GET single debit
export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        await connectDB();
        const { id } = await params;
        const debit = await Debit.findById(id).populate(populateFields);

        if (!debit) {
            return NextResponse.json({ error: "Debit not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, debit });
    } catch (error) {
        return NextResponse.json({ error: error }, { status: 500 });
    }
}

// UPDATE debit
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        await connectDB();
        const { id } = await params;
        const data = await req.json();

        await Debit.findByIdAndUpdate(id, data, { returnDocument: 'after' });

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: error }, { status: 500 });
    }
}

// DELETE debit
export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        await connectDB();
        const { id } = await params;
        await Debit.findByIdAndDelete(id);

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: error }, { status: 500 });
    }
}
