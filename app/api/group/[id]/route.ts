import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Group from "@/models/Group";
import mongoose from "mongoose";
import Client from "@/models/Client";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectDB();
        const { id } = await params;

        let group;

        // If valid ObjectId → search by _id
        if (mongoose.Types.ObjectId.isValid(id)) {
            group = await Group.findById(id)
                .populate("branch")
                .populate("createdBy")
                .populate("employee");
        } else {
            // Otherwise search by numeric groupId
            group = await Group.findOne({ groupId: id })
                .populate("branch")
                .populate("createdBy")
                .populate("employee");
        }

        if (!group) {
            return NextResponse.json(
                { error: "Group not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(group);
    } catch (error) {
        return NextResponse.json(
            { error: error },
            { status: 400 }
        );
    }
}

export async function PUT(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectDB();
        const { id } = await params;
        const body = await req.json();

        const updated = await Group.findOneAndUpdate(
            { _id: id },  // Use your custom ID field
            body,
            {
                returnDocument: 'after',
                runValidators: true,
            }
        );

        if (!updated) {
            return NextResponse.json({ error: "Group not found" }, { status: 404 });
        }

        return NextResponse.json(updated);
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: err }, { status: 400 });
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectDB();
        const { id } = await params;

        /* ---------- CHECK APPROVED CLIENTS ---------- */

        const approvedClients = await Client.exists({
            group: id,
            status: "APPROVED",
        });

        if (approvedClients) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Group cannot be deleted because approved customers exist",
                },
                { status: 400 }
            );
        }

        /* ---------- DELETE GROUP ---------- */

        await Group.findByIdAndDelete(id);

        return NextResponse.json({
            success: true,
            message: "Group deleted successfully",
        });

    } catch (error) {
        console.error(error);

        return NextResponse.json(
            { success: false, error: "Delete failed" },
            { status: 500 }
        );
    }
}
