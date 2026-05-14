import { NextResponse } from "next/server";
import User from "@/models/User";
import Group from "@/models/Group";
import { connectDB } from "@/lib/db";

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    await connectDB();

    const { id } = await params;

    /* CHECK GROUP ASSIGNMENT */

    const group = await Group.findOne({ employee: id });

    if (group) {
        return NextResponse.json(
            { message: "Employee has assigned groups. Remove them first." },
            { status: 400 }
        );
    }

    /* DELETE USER */

    await User.findByIdAndDelete(id);

    return NextResponse.json({
        message: "Employee deleted",
    });
}