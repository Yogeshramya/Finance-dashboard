import Branch from "@/models/Branch";
import { connectDB } from "@/lib/db";

export async function GET() {
    await connectDB();
    const branches = await Branch.find().sort({ createdAt: -1 });
    return Response.json(branches);
}

export async function POST(req: Request) {
    await connectDB();
    const body = await req.json();

    const branch = await Branch.create(body);
    return Response.json(branch, { status: 201 });
}
