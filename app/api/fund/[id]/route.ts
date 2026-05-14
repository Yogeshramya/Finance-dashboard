import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Loan from "@/models/Loan";
import User from "@/models/User";
import Scheme from "@/models/Scheme";
import Client from "@/models/Client";
import Group from "@/models/Group";

// Fields to populate from related collections
const populateFields = [
    { path: "employee", select: "name", model: User },
    { path: "scheme", select: "schemeName", model: Scheme },
    { path: "customer", select: "customerCode name phone", model: Client },
    {
        path: "group",
        select: "_id groupName employee",
        model: Group,
        populate: {
            path: "employee",
            select: "name",
        },
    },
];

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        await connectDB();
        const { id } = await params;

        const loan = await Loan.findById(id)
            .populate(populateFields)
            .lean();

        if (!loan) {
            return NextResponse.json(
                { success: false, error: "Loan not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            loan,
        });

    } catch (error) {
        console.log(error);
        return NextResponse.json(
            { success: false, error: error },
            { status: 500 }
        );
    }
}
