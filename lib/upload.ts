import { PutObjectCommand } from "@aws-sdk/client-s3";
import { r2 } from "@/lib/r2";
import { nanoid } from "nanoid";
import sharp from "sharp";

export async function uploadToR2(file: File, folder: string) {
    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const key = `${folder}/${nanoid()}.${ext}`;

    const arrayBuffer = await file.arrayBuffer();
    let data: Uint8Array | Buffer = new Uint8Array(arrayBuffer); // 🔥 USE Uint8Array
    let contentType = file.type;

    /* ================= IMAGE COMPRESSION ================= */
    if (file.type.startsWith("image/")) {
        const compressed = await sharp(data) // ✅ NO Buffer here
            .rotate()
            .resize({
                width: 1280,
                withoutEnlargement: true,
            })
            .jpeg({
                quality: 70,
                mozjpeg: true,
            })
            .toBuffer();

        data = compressed; // now Buffer, but TS is happy
        contentType = "image/jpeg";
    }

    /* ================= UPLOAD ================= */
    await r2.send(
        new PutObjectCommand({
            Bucket: process.env.R2_BUCKET_NAME!,
            Key: key,
            Body: data, // Buffer | Uint8Array both accepted
            ContentType: contentType,
        })
    );

    return `https://${process.env.R2_PUBLIC_DOMAIN}/${key}`;
}
