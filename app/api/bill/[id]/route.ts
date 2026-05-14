import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Bill from "@/models/Bill";
import User from "@/models/User";   // required for populate employee
import Group from "@/models/Group";  // required for populate group

const populateFields = [
    { path: "employee", select: "name", model: User },
    { path: "group", select: "groupName", model: Group },
];
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    await connectDB();
    const { id } = await params;
    const bill = await Bill.findById(id).populate(populateFields);
    return NextResponse.json({ success: true, bill: bill });
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    await connectDB();
    const { id } = await params;
    const body = await req.json();
    const updated = await Bill.findByIdAndUpdate(id, body, { returnDocument: 'after' });
    return NextResponse.json({ success: true, bill: updated });
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    await connectDB();
    const { id } = await params;
    await Bill.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
}
