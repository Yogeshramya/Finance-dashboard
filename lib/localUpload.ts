import fs from "fs";
import path from "path";

export async function saveLocalFile(file: File, folder: string, filename: string) {
    // Detect if running on localhost or pterodactyl
    const isDev = process.env.NODE_ENV !== "production";

    const basePath = isDev
        ? path.join(process.cwd(), "public", "uploads")   // local dev
        : "/home/container/uploads";                      // pterodactyl server

    const folderPath = path.join(basePath, folder);
    const filePath = path.join(folderPath, filename);

    // Create folders recursively
    fs.mkdirSync(folderPath, { recursive: true });

    const buffer = Buffer.from(await file.arrayBuffer());
    fs.writeFileSync(filePath, buffer);

    // For dev: return absolute URL from Next.js public folder
    if (isDev) {
        return `/uploads/${folder}/${filename}`;
    }

    // For server: return URL from /uploads route
    return `/uploads/${folder}/${filename}`;
}
