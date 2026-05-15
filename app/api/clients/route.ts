import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { connectDB } from "@/lib/db";
import Client from "@/models/Client";
import User from "@/models/User";
import Group from "@/models/Group";

const secret = process.env.NEXTAUTH_SECRET!;

const populateFields = [
    { path: "employee", select: "name", model: User },
    {
        path: "group",
        select: "groupName employee createdBy",
        model: Group,
        populate: [
            { path: "employee", select: "name", model: User },
            { path: "createdBy", select: "name", model: User },
        ],
    },
];

type Condition =
    | { [field: string]: { $regex: string; $options: string } }
    | { [field: string]: string }
    | { [field: string]: number };

interface ClientQuery {
    branch: string;
    $or?: Condition[];
    group?: string;
    createdAt?: { $gte?: Date; $lte?: Date };
    status?: string;
}

/* ================= GET CLIENTS ================= */

export async function GET(req: Request) {
    try {
        await connectDB();

        const token = await getToken({ req: req as NextRequest, secret });
        if (!token)
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { searchParams } = new URL(req.url);

        const search = searchParams.get("search");
        const groupId = searchParams.get("groupId");
        const today = searchParams.get("today");
        const from = searchParams.get("from");
        const to = searchParams.get("to");
        const status = searchParams.get("status");

        const query: any = {};

        if (token.branch?._id) {
            query.branch = token.branch._id;
        }

        /* ---------- SEARCH ---------- */

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: "i" } },
                { customerCode: { $regex: search, $options: "i" } },
                { phone: { $regex: search, $options: "i" } },
            ];
        }

        if (groupId) query.group = groupId;

        if (today === "true") {
            const start = new Date();
            start.setUTCHours(0, 0, 0, 0);

            const end = new Date();
            end.setUTCHours(23, 59, 59, 999);

            query.createdAt = { $gte: start, $lte: end };
        }

        if (status === "ACTIVE") {
            query.status = "APPROVED";
        }

        if (from && to) {
            const start = new Date(from);
            const end = new Date(to);
            end.setUTCHours(23, 59, 59, 999);

            query.createdAt = { $gte: start, $lte: end };
        }

        const clients = await Client.find(query)
            .populate(populateFields)
            .lean();

        return NextResponse.json({
            success: true,
            count: clients.length,
            clients,
        });
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { success: false, error },
            { status: 500 }
        );
    }
}

/* ================= CREATE CLIENT ================= */

export async function POST(req: Request) {
    try {
        await connectDB();

        const token = await getToken({ req: req as NextRequest, secret });
        if (!token)
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const data = await req.json();

        const customerPhone = data.phone;
        const nomineePhone = data.nominee?.phone;

        /* ---------- VALIDATE PHONE ---------- */

        if (customerPhone && nomineePhone && customerPhone === nomineePhone) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Customer and nominee phone cannot be same",
                },
                { status: 400 }
            );
        }

        /* ---------- DUPLICATE CHECK ---------- */

        const existingClient = await Client.findOne({
            branch: token.branch?._id,
            status: "APPROVED",
            $or: [
                { phone: customerPhone },
                { "nominee.phone": customerPhone },
                ...(nomineePhone
                    ? [
                        { phone: nomineePhone },
                        { "nominee.phone": nomineePhone },
                    ]
                    : []),
            ],
        }).select("_id name customerCode phone nominee.phone");

        if (existingClient) {
            return NextResponse.json(
                {
                    success: false,
                    exists: true,
                    message: "Customer already exists with same phone",
                    conflictWith: {
                        customerId: existingClient._id,
                        customerCode: existingClient.customerCode,
                        name: existingClient.name,
                        phone: existingClient.phone,
                        nomineePhone: existingClient.nominee?.phone,
                    },
                },
                { status: 409 }
            );
        }

        /* ---------- CREATE CLIENT ---------- */

        const newClient = new Client({
            ...data,

            createdBy: token.id,
            employee: token.id,
            branch: token.branch?._id,
            status: "PENDING",
        });

        await newClient.save();

        const populatedClient = await Client.findById(newClient._id)
            .populate(populateFields)
            .lean();

        return NextResponse.json({
            success: true,
            client: populatedClient,
        });
    } catch (error) {
        console.error(error);

        return NextResponse.json(
            { success: false, error },
            { status: 500 }
        );
    }
}