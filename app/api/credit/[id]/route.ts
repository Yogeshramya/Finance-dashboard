import { NextResponse } from "next/server";
import Credit from "@/models/Credit";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import Branch from "@/models/Branch";
const populateFields = [
    { path: "employee", select: "_id name", model: User },
    { path: "branch", select: "_id name code", model: Branch }
];
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        await connectDB();
        const { id } = await params;
        const data = await req.json();

        await Credit.findByIdAndUpdate(id, data, { returnDocument: 'after' });

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: error }, { status: 500 });
    }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        await connectDB();
        const { id } = await params;
        await Credit.findByIdAndDelete(id);

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: error }, { status: 500 });
    }
}

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        await connectDB();
        const { id } = await params;
        const credit = await Credit.findById(id).populate(populateFields);

        if (!credit) {
            return NextResponse.json(
                { error: "Credit not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, credit });
    } catch (error) {
        return NextResponse.json({ error: error }, { status: 500 });
    }
}
