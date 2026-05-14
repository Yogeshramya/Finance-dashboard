import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST() {
    const session = await getServerSession(authOptions);

    if (!session) {
        return NextResponse.json({ message: "No active session" }, { status: 400 });
    }

    // NextAuth handles logout on client via `signOut()`
    // This API is optional for consistency
    return NextResponse.json({ message: "Logged out successfully" });
}
