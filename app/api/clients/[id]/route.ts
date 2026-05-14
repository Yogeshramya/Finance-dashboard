import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { uploadToR2 } from "@/lib/upload";

import Client from "@/models/Client";
import User from "@/models/User";
import Group from "@/models/Group";
import Loan from "@/models/Loan";

const populateFields = [
    { path: "employee", select: "_id name", model: User },
    { path: "group", select: "_id groupName employee", model: Group },
];

/* ------------------------- TYPES ------------------------- */

interface UploadMap {
    memberPhoto?: string;
    memberAadhaarFront?: string;
    memberAadhaarBack?: string;
    documentFile?: string;

    nomineePhoto?: string;
    nomineeAadhaarFront?: string;
    nomineeAadhaarBack?: string;
}

type FileKey =
    | "memberPhoto"
    | "memberAadhaarFront"
    | "memberAadhaarBack"
    | "documentFile"
    | "nomineePhoto"
    | "nomineeAadhaarFront"
    | "nomineeAadhaarBack";

/* ------------------------- GET ------------------------- */

export async function GET(req: Request, context: { params: Promise<{ id: string }> }) {
    await connectDB();

    const { id } = await context.params;

    const client = await Client.findById(id).populate(populateFields);
    if (!client) {
        return NextResponse.json(
            { success: false, error: "Client not found" },
            { status: 404 }
        );
    }

    return NextResponse.json({ success: true, client });
}

/* ------------------------- PUT ------------------------- */

export async function PUT(req: Request, context: { params: Promise<{ id: string }> }) {
    try {
        await connectDB();
        const { id } = await context.params;

        const formData = await req.formData();
        const data = JSON.parse(formData.get("data") as string);

        const client = await Client.findById(id);
        if (!client) {
            return NextResponse.json(
                { success: false, error: "Client not found" },
                { status: 404 }
            );
        }

        const customerPhone = data.phone;
        const nomineePhone = data.nominee?.phone;

        // Customer & nominee phone cannot be same
        if (customerPhone && nomineePhone && customerPhone === nomineePhone) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Customer and nominee phone number cannot be the same",
                },
                { status: 400 }
            );
        }

        // Check duplicates excluding current client
        const duplicateClient = await Client.findOne({
            _id: { $ne: id }, // exclude current client
            branch: client.branch,
            status: "APPROVED",
            $or: [
                { phone: customerPhone },
                { "nominee.phone": customerPhone },
                { phone: nomineePhone },
                { "nominee.phone": nomineePhone },
            ],
        }).select("_id name customerCode phone nominee.phone");

        if (duplicateClient) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Phone number already exists",
                    conflictWith: {
                        customerCode: duplicateClient.customerCode,
                        name: duplicateClient.name,
                        phone: duplicateClient.phone,
                        nomineePhone: duplicateClient.nominee?.phone,
                    },
                },
                { status: 409 }
            );
        }


        const safeName = data.name.replace(/\s+/g, "-");
        const baseFolder = `clients/${data.customerCode}_${safeName}`;

        const uploads: UploadMap = {};

        // Typed file fields
        const fileFields: Record<Exclude<FileKey,
            "documentFile"
        >, { folder: string }> = {
            memberPhoto: { folder: "member" },
            memberAadhaarFront: { folder: "member" },
            memberAadhaarBack: { folder: "member" },
            nomineePhoto: { folder: "nominee" },
            nomineeAadhaarFront: { folder: "nominee" },
            nomineeAadhaarBack: { folder: "nominee" },
        };

        // Upload loop
        for (const key of Object.keys(fileFields) as Exclude<FileKey, "documentFile">[]) {
            const file = formData.get(key) as File | null;
            if (file) {
                const path = `${baseFolder}/${fileFields[key].folder}/${key}_${data.customerCode}.jpg`;
                uploads[key] = await uploadToR2(file, path);
            }
        }

        // Document file (separate)
        const documentFile = formData.get("documentFile") as File | null;
        if (documentFile) {
            const path = `${baseFolder}/member/document_${data.customerCode}.jpg`;
            uploads.documentFile = await uploadToR2(documentFile, path);
        }

        // Prepare nominee object
        const updatedNominee = {
            name: data.nominee.name,
            dob: data.nominee.dob,
            age: data.nominee.age,
            gender: data.nominee.gender,
            aadhar: data.nominee.aadhar,
            phone: data.nominee.phone,
            relation: data.nominee.relation,
            photo: uploads.nomineePhoto || client.nominee?.photo,
            aadhaarFront: uploads.nomineeAadhaarFront || client.nominee?.aadhaarFront,
            aadhaarBack: uploads.nomineeAadhaarBack || client.nominee?.aadhaarBack,
        };

        await Client.findByIdAndUpdate(id, {
            ...data,
            ...uploads,
            nominee: updatedNominee,
            documentFile: uploads.documentFile || client.documentFile,
        });

        return NextResponse.json({ success: true });

    } catch (err) {
        console.error(err);
        const errorMessage = err instanceof Error ? err.message : "Unexpected error";
        return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
    }
}

/* ------------------------- DELETE ------------------------- */

export async function DELETE(req: Request, context: { params: Promise<{ id: string }> }) {
    try {
        await connectDB();

        const { id } = await context.params;

        /* -------- CHECK LOANS -------- */

        const loanExists = await Loan.exists({
            customer: id,
            status: "APPROVED",
        });

        if (loanExists) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Client cannot be deleted because an approved loan exists",
                },
                { status: 400 }
            );
        }

        /* -------- DELETE CLIENT -------- */

        await Client.findByIdAndDelete(id);

        return NextResponse.json({ success: true });

    } catch (err) {
        console.error(err);

        return NextResponse.json(
            { success: false, error: "Server error" },
            { status: 500 }
        );
    }
}
