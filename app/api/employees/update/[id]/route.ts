import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { getToken } from "next-auth/jwt";
import mongoose from "mongoose";

const secret = process.env.NEXTAUTH_SECRET!;

interface Filter {
    name?: string;
    role?: string;
    branch?: string | null;
    branches?: string[];
    password?: string;
}

export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {

    await connectDB();

    try {

        const token = await getToken({ req, secret });

        if (!token) {
            return NextResponse.json(
                { message: "Unauthorized" },
                { status: 401 }
            );
        }

        const { id } = await params;

        const body = await req.json();

        const { name, role, branch, branches, password } = body;

        const userToEdit = await User.findById(id);

        if (!userToEdit) {
            return NextResponse.json(
                { message: "User not found" },
                { status: 404 }
            );
        }

        /* ---------------- ROLE PERMISSIONS ---------------- */

        if (token.role === "ADMINISTRATOR") {
            // Admin can edit anyone
        }

        else if (token.role === "AREA_MANAGER") {

            if (
                userToEdit.role !== "MANAGER" &&
                userToEdit.role !== "EMPLOYEE_MFI"
            ) {
                return NextResponse.json(
                    { message: "Cannot edit this role" },
                    { status: 403 }
                );
            }

        }

        else if (token.role === "MANAGER") {

            if (userToEdit.role !== "EMPLOYEE_MFI") {
                return NextResponse.json(
                    { message: "Manager cannot edit this role" },
                    { status: 403 }
                );
            }

            if (role && role !== "EMPLOYEE_MFI") {
                return NextResponse.json(
                    { message: "Manager cannot change role" },
                    { status: 403 }
                );
            }

            if (
                String(userToEdit.branch) !==
                String(token.branch)
            ) {
                return NextResponse.json(
                    { message: "Cannot edit outside your branch" },
                    { status: 403 }
                );
            }

        }

        else {

            return NextResponse.json(
                { message: "Not authorized" },
                { status: 403 }
            );

        }

        /* ---------------- VALIDATION ---------------- */

        if (role === "AREA_MANAGER") {

            if (!branches || branches.length === 0) {
                return NextResponse.json(
                    { message: "Area manager must have branches" },
                    { status: 400 }
                );
            }

        }

        if (
            role === "MANAGER" ||
            role === "EMPLOYEE_MFI"
        ) {

            if (!branch) {
                return NextResponse.json(
                    { message: "Branch required" },
                    { status: 400 }
                );
            }

            if (!mongoose.Types.ObjectId.isValid(branch)) {
                return NextResponse.json(
                    { message: "Invalid branch" },
                    { status: 400 }
                );
            }

        }

        /* ---------------- BUILD UPDATE DATA ---------------- */

        const updateData: Filter = {
            name,
            role,
        };

        if (role === "ADMINISTRATOR") {
            updateData.branch = null;
            updateData.branches = [];
        }

        if (role === "AREA_MANAGER") {
            updateData.branch = branch;
            updateData.branches = branches;
        }

        if (
            role === "MANAGER" ||
            role === "EMPLOYEE_MFI"
        ) {

            updateData.branch =
                token.role === "MANAGER"
                    ? token.branch
                    : branch;

            updateData.branches = [];
        }

        /* ---------------- PASSWORD ---------------- */

        if (password) {

            /*if (password.length < 6) {
                return NextResponse.json(
                    { message: "Password must be at least 6 characters" },
                    { status: 400 }
                );
            }*/

            updateData.password = await bcrypt.hash(
                password,
                10
            );

        }

        const updatedUser = await User
            .findByIdAndUpdate(
                id,
                updateData,
                { new: true }
            )
            .select("-password");

        return NextResponse.json(updatedUser);

    }

    catch (error) {

        console.error("Update error:", error);

        return NextResponse.json(
            { message: "Server error" },
            { status: 500 }
        );

    }

}