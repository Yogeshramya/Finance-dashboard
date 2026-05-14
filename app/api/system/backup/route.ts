import { NextResponse } from "next/server";
import { exec } from "child_process";
import path from "path";
import fs from "fs";

export async function GET(): Promise<Response> {

    try {

        const backupDir = path.join(process.cwd(), "backups");

        if (!fs.existsSync(backupDir)) {
            fs.mkdirSync(backupDir);
        }

        const date = new Date().toISOString().split("T")[0];
        const backupPath = path.join(backupDir, `backup-${date}`);

        const mongoUri = process.env.MONGODB_URI;

        const command = `mongodump --uri="${mongoUri}" --out=${backupPath}`;

        return await new Promise<Response>((resolve) => {

            exec(command, (error) => {

                if (error) {
                    resolve(
                        NextResponse.json(
                            { success: false, message: error.message },
                            { status: 500 }
                        )
                    );
                } else {
                    resolve(
                        NextResponse.json({
                            success: true,
                            message: "Backup created",
                            path: backupPath,
                        })
                    );
                }

            });

        });

    } catch (err) {

        console.error("Backup error:", err);

        return NextResponse.json(
            { success: false, message: "Backup failed" },
            { status: 500 }
        );

    }

}