"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import PageHeader from "@/components/PageHeader";
import { toast } from "sonner";
import { Credit } from "@/types/credit";

export default function ViewCreditPage() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();

    const [credit, setCredit] = useState<Credit | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadCredit() {
            try {
                const res = await fetch(`/api/credit/${id}`);
                const data = await res.json();

                if (!res.ok || !data.success) {
                    toast.error("Failed to load credit");
                    return;
                }

                setCredit(data.credit);
            } catch (err) {
                console.error(err);
                toast.error("Something went wrong");
            } finally {
                setLoading(false);
            }
        }

        loadCredit();
    }, [id]);

    if (loading) {
        return <p className="p-6">Loading...</p>;
    }

    if (!credit) {
        return <p className="p-6">Credit not found</p>;
    }

    return (
        <section className="max-w-4xl mx-auto p-6 space-y-6 print:max-w-full">
            <PageHeader />

            {/* TITLE (HIDDEN IN PRINT) */}
            <h1 className="text-2xl font-bold print:hidden">
                View Credit
            </h1>

            {/* CREDIT CARD */}
            <Card className="p-6 space-y-6 print:border-none">

                {/* HEADER */}
                <div className="text-center">
                    <h2 className="text-xl font-bold">
                        CREDIT ENTRY
                    </h2>
                    <p className="text-sm text-gray-600">
                        Status: {credit.status}
                    </p>
                </div>

                {/* DETAILS GRID */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <p><b>Branch:</b> {credit.branch?.name}</p>
                    <p><b>Date:</b> {credit.date}</p>
                    <p><b>Title:</b> {credit.title}</p>
                    <p><b>Amount:</b> ₹{credit.amount}</p>
                    <p><b>Type:</b> Credit</p>
                </div>

                {/* DETAILS */}
                <div>
                    <p className="font-semibold">Details</p>
                    <div className="border rounded p-3 mt-1 text-sm print:border-none">
                        {credit.details}
                    </div>
                </div>

                {/* SIGNATURE AREA (PRINT ONLY) */}
                <div className="flex justify-between mt-12 text-sm">
                    <div>
                        <p>Prepared By</p>
                        <div className="border-t w-40 mt-6 pt-1">
                            {credit.employee?.name || ""}
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
