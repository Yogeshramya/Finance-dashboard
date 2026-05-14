import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Scheme from "@/models/Scheme";

export async function POST(req: Request) {
    try {
        await connectDB();
        const data = await req.json();

        await Scheme.create(data);

        return NextResponse.json({ success: true });
    } catch (err) {
        console.log(err);
        return NextResponse.json({ success: false }, { status: 500 });
    }
}
