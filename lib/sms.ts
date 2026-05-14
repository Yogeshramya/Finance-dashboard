import twilio from "twilio";

export async function sendOtpSms(phone: string, otp: string) {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const twilioPhone = process.env.TWILIO_PHONE;

    if (!accountSid || !authToken || !twilioPhone) {
        console.warn("Twilio credentials missing. Skipping SMS dispatch.");
        return null;
    }

    const client = twilio(accountSid, authToken);

    const message = await client.messages.create({
        body: `Your loan OTP is ${otp}. Valid for 5 minutes.`,
        from: twilioPhone,
        to: `+91${phone}`, // India
    });

    return message.sid;
}
