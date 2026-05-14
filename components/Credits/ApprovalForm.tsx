"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import TextareaAutosize from "react-textarea-autosize";
import { Credit } from "@/types/credit";

type ApprovalFormProps = { credit: Credit };

export default function CreditApprovalForm({ credit }: ApprovalFormProps) {
    const router = useRouter();
    const [remarks, setRemarks] = useState("");

    async function approve() {
        if (!remarks.trim()) {
            toast.error("Remarks are required");
            return;
        }

        const res = await fetch(`/api/credit/approve/${credit._id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ remarks })
        });

        if (res.ok) {
            toast.success("Credit Approved");
            router.push("/dashboard/approval/credit");
        } else {
            toast.error("Approval failed");
        }
    }

    async function reject() {
        if (!remarks.trim()) {
            toast.error("Remarks are required");
            return;
        }

        const res = await fetch(`/api/credit/reject/${credit._id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ remarks })
        });

        if (res.ok) {
            toast.success("Credit Rejected");
            router.push("/dashboard/approval/credit");
        } else {
            toast.error("Rejection failed");
        }
    }

    return (
        <section className="space-y-8">
            <h1 className="text-3xl font-bold text-blue-700">
                Credit Approval
            </h1>

            {/* CREDIT INFO */}
            <div className="border p-5 rounded-lg bg-gray-50">
                <h2 className="text-xl font-semibold mb-4">Credit Details</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <p><b>Date:</b> {new Date(credit.date).toLocaleDateString()}</p>
                    <p><b>Title:</b> {credit.title}</p>
                    <p><b>Amount:</b> ₹{credit.amount}</p>
                    <p><b>Mode:</b> {credit.mode}</p>
                    <p className="md:col-span-2">
                        <b>Description:</b> {credit.details}
                    </p>
                </div>
            </div>

            {/* REMARKS */}
            <div className="border p-5 rounded-lg bg-white">
                <Label>Remarks</Label>
                <TextareaAutosize
                    minRows={3}
                    className="w-full border rounded p-3 mt-2"
                    placeholder="Enter approval remarks..."
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                />
            </div>

            <div className="flex gap-6">
                <Button
                    className="bg-green-600 hover:bg-green-700 px-10 py-4 text-lg"
                    onClick={approve}
                >
                    APPROVE
                </Button>

                <Button
                    className="bg-red-600 hover:bg-red-700 px-10 py-4 text-lg"
                    onClick={reject}
                >
                    REJECT
                </Button>
            </div>
        </section>
    );
}
