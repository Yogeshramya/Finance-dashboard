import mongoose from "mongoose";

const OtpSchema = new mongoose.Schema(
    {
        phone: { type: String, required: true },
        otpHash: { type: String, required: true },
        purpose: { type: String, required: true },
        expiresAt: { type: Date, required: true },
        verified: { type: Boolean, default: false },
    },
    { timestamps: true }
);

// Auto delete expired OTPs
OtpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.models.Otp || mongoose.model("Otp", OtpSchema);
