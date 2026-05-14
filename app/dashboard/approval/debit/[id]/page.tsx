"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Debit } from "@/types/debit";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import TextareaAutosize from "react-textarea-autosize";
import { toast } from "sonner";

export default function DebitApprovalForm() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();

    const [debit, setDebit] = useState<Debit | null>(null);
    const [remarks, setRemarks] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDebit = async () => {
            try {
                const res = await fetch(`/api/debit/${id}`);
                const data = await res.json();

                if (!res.ok) throw new Error();
                setDebit(data.debit);
            } catch {
                toast.error("Debit not found");
                router.push("/dashboard/approval/debit");
            } finally {
                setLoading(false);
            }
        };
        fetchDebit();
    }, [id, router]);

    const approve = async () => {
        if (!remarks.trim()) {
            toast.error("Remarks required");
            return;
        }

        const res = await fetch(`/api/debit/approve/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ remarks }),
        });

        if (res.ok) {
            toast.success("Debit Approved");
            router.push("/dashboard/approval/debit");
        } else {
            toast.error("Approval failed");
        }
    };

    const reject = async () => {
        if (!remarks.trim()) {
            toast.error("Remarks required");
            return;
        }

        const res = await fetch(`/api/debit/reject/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ remarks }),
        });

        if (res.ok) {
            toast.success("Debit Rejected");
            router.push("/dashboard/approval/debit");
        } else {
            toast.error("Rejection failed");
        }
    };

    if (loading) {
        return <p className="text-center mt-10">Loading debit...</p>;
    }

    if (!debit) return null;

    return (
        <section className="max-w-5xl mx-auto space-y-8 p-4">
            <h1 className="text-3xl font-bold text-red-600">
                Debit Approval
            </h1>

            {/* Debit Info */}
            <div className="border p-5 rounded-lg bg-gray-50">
                <h2 className="text-xl font-semibold mb-4">
                    Debit Details
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <p><b>Date:</b> {new Date(debit.date).toLocaleDateString()}</p>
                    <p><b>Title:</b> {debit.title}</p>
                    <p><b>Amount:</b> ₹{debit.amount.toLocaleString()}</p>
                    <p><b>Mode:</b> {debit.mode}</p>
                    <p className="md:col-span-2">
                        <b>Description:</b> {debit.details}
                    </p>
                </div>
            </div>

            {/* Remarks */}
            <div className="border p-5 rounded-lg">
                <Label>Remarks</Label>
                <TextareaAutosize
                    minRows={3}
                    className="w-full border rounded p-3 mt-2"
                    placeholder="Enter approval / rejection remarks..."
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                />
            </div>

            {/* Actions */}
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
