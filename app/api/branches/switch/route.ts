import { authOptions } from "@/lib/auth"
import User from "@/models/User"
import { getServerSession } from "next-auth"
import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {

    const { branchId } = await req.json()

    const session = await getServerSession(authOptions)

    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const user = await User.findById(session.user.id)

    if (session.user.role === "ADMINISTRATOR") {
        session.user.activeBranch = branchId
    }

    if (session.user.role === "AREA_MANAGER") {
        if (!user.branches.includes(branchId))
            return NextResponse.json({ error: "Not allowed" }, { status: 403 })

        session.user.activeBranch = branchId
    }

    return NextResponse.json({ success: true })
}