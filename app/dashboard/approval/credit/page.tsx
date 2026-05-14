"use client";

import { useEffect, useState } from "react";
import { Credit } from "@/types/credit";
import { toast } from "sonner";
import CreditApprovalTable from "@/components/Credits/ApprovalTable";
import PageHeader from "@/components/PageHeader";

export default function CreditApprovalPage() {
    const [credits, setCredits] = useState<Credit[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCredits();
    }, []);

    async function fetchCredits() {
        try {
            setLoading(true);

            const res = await fetch("/api/credit/pending");

            if (!res.ok) {
                throw new Error("Failed to fetch credits");
            }

            const data = await res.json();
            setCredits(data.credits || []);
        } catch (error) {
            console.log(error);
            toast.error("Unable to load credit approvals");
        } finally {
            setLoading(false);
        }
    }

    if (loading) {
        return (
            <div className="p-6 text-center text-gray-500">
                Loading pending credits...
            </div>
        );
    }

    return (
        <section className="space-y-6">
            <PageHeader />
            <h1 className="text-2xl font-bold text-blue-700">
                Credit Approvals
            </h1>

            <CreditApprovalTable credits={credits} />
        </section>
    );
}   
