import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Otp from "@/models/Otp";
import { hashOtp } from "@/lib/otp";

export async function POST(req: NextRequest) {
    try {
        await connectDB();

        const { phone, otp, purpose } = await req.json();
        if (!phone || !otp || !purpose) {
            return NextResponse.json(
                { success: false, error: "Invalid request" },
                { status: 400 }
            );
        }

        const record = await Otp.findOne({
            phone,
            purpose,
            verified: false,
            expiresAt: { $gt: new Date() },
        });

        if (!record) {
            return NextResponse.json(
                { success: false, error: "OTP expired or invalid" },
                { status: 400 }
            );
        }

        if (record.otpHash !== hashOtp(otp)) {
            return NextResponse.json(
                { success: false, error: "Incorrect OTP" },
                { status: 400 }
            );
        }

        record.verified = true;
        await record.save();

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error("OTP Verify Error:", err);
        return NextResponse.json(
            { success: false, error: "OTP verification failed" },
            { status: 500 }
        );
    }
}
