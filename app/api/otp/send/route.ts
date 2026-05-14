import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Otp from "@/models/Otp";
import { generateOtp, hashOtp } from "@/lib/otp";
import { sendOtpSms } from "@/lib/sms";

export async function POST(req: NextRequest) {
    try {
        await connectDB();

        const { phone, purpose } = await req.json();
        if (!phone || !purpose) {
            return NextResponse.json(
                { success: false, error: "Phone & purpose required" },
                { status: 400 }
            );
        }

        const otp = generateOtp();
        const otpHash = hashOtp(otp);

        // Remove old OTPs
        await Otp.deleteMany({ phone, purpose });

        await Otp.create({
            phone,
            otpHash,
            purpose,
            expiresAt: new Date(Date.now() + 5 * 60 * 1000),
        });

        // Send SMS via Twilio
        await sendOtpSms(phone, otp);

        // DEV ONLY
        if (process.env.NODE_ENV !== "production") {
            console.log("DEV OTP:", otp);
        }

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error("OTP Send Error:", err);
        return NextResponse.json(
            { success: false, error: "Failed to send OTP" },
            { status: 500 }
        );
    }
}
