"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import PageHeader from "@/components/PageHeader";
import { toast } from "sonner";
import { Debit } from "@/types/debit";

export default function ViewDebitPage() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();

    const [debit, setDebit] = useState<Debit | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadDebit() {
            try {
                const res = await fetch(`/api/debit/${id}`);
                const data = await res.json();

                if (!res.ok || !data.success) {
                    toast.error("Failed to load debit");
                    return;
                }

                setDebit(data.debit);
            } catch (err) {
                console.error(err);
                toast.error("Something went wrong");
            } finally {
                setLoading(false);
            }
        }

        loadDebit();
    }, [id]);

    if (loading) {
        return <p className="p-6">Loading...</p>;
    }

    if (!debit) {
        return <p className="p-6">Debit not found</p>;
    }

    return (
        <section className="max-w-4xl mx-auto p-6 space-y-6 print:max-w-full">
            <PageHeader />

            {/* TITLE (HIDDEN IN PRINT) */}
            <h1 className="text-2xl font-bold print:hidden">
                View Debit
            </h1>

            {/* DEBIT CARD */}
            <Card className="p-6 space-y-6 print:border-none">

                {/* HEADER */}
                <div className="text-center">
                    <h2 className="text-xl font-bold">
                        DEBIT ENTRY
                    </h2>
                    <p className="text-sm text-gray-600">
                        Status: {debit.status}
                    </p>
                </div>

                {/* DETAILS GRID */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <p><b>Branch:</b> {debit.branch?.name}</p>
                    <p><b>Date:</b> {debit.date}</p>
                    <p><b>Title:</b> {debit.title}</p>
                    <p><b>Amount:</b> ₹{debit.amount}</p>
                    <p><b>Type:</b> Debit</p>
                </div>

                {/* DETAILS */}
                <div>
                    <p className="font-semibold">Details</p>
                    <div className="border rounded p-3 mt-1 text-sm print:border-none">
                        {debit.details}
                    </div>
                </div>

                {/* SIGNATURE AREA (PRINT) */}
                <div className="flex justify-between mt-12 text-sm">
                    <div>
                        <p>Prepared By</p>
                        <div className="border-t w-40 mt-6 pt-1">
                            {debit.employee?.name || ""}
                        </div>
                    </div>
                    <div>
                        <p>Authorized Signature</p>
                        <div className="border-t w-40 mt-6 pt-1"></div>
                    </div>
                </div>

                {/* ACTION BUTTONS (HIDDEN IN PRINT) */}
                <div className="flex justify-between gap-4 pt-6 print:hidden">
                    <Button
                        variant="secondary"
                        onClick={() => router.back()}
                    >
                        Back
                    </Button>

                    <Button
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                        onClick={() => window.print()}
                    >
                        Print
                    </Button>
                </div>
            </Card>
        </section>
    );
}
