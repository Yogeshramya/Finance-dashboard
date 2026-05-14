import { NextRequest, NextResponse } from "next/server";
import { uploadToR2 } from "@/lib/upload";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { r2 } from "@/lib/r2";

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get("file") as File;
        const folder = formData.get("folder") as string || "temp";

        if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

        const url = await uploadToR2(file, folder);
        return NextResponse.json({ success: true, url });
    } catch (error) {
        console.error("Upload error:", error);
        return NextResponse.json({ success: false, error: "Upload failed" }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const { url } = await req.json();
        const urlObj = new URL(url);
        const key = urlObj.pathname.substring(1); // Remove leading slash

        await r2.send(new DeleteObjectCommand({
            Bucket: process.env.R2_BUCKET_NAME!,
            Key: key,
        }));

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Delete error:", error);
        return NextResponse.json({ success: false }, { status: 500 });
    }
}