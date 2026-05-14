import twilio from "twilio";

const client = twilio(
    process.env.TWILIO_ACCOUNT_SID!,
    process.env.TWILIO_AUTH_TOKEN!
);

export async function sendOtpSms(phone: string, otp: string) {
    const message = await client.messages.create({
        body: `Your loan OTP is ${otp}. Valid for 5 minutes.`,
        from: process.env.TWILIO_PHONE!,
        to: `+91${phone}`, // India
    });

    return message.sid;
}
