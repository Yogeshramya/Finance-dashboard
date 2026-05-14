"use client";

import { useEffect, useState } from "react";
import ProvideLoanForm from "@/components/Funds/ProvideLoadForm";
import PageHeader from "@/components/PageHeader";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { Customer } from "@/types/customer";

export default function ProvideLoanPage() {
    const { customerId } = useParams();
    const [customer, setCustomer] = useState<Customer | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadCustomer() {
            try {
                const res = await fetch(`/api/clients/${customerId}`, {
                    cache: "no-store",
                });

                const data = await res.json();

                if (!res.ok || !data.client) {
                    toast.error("Customer not found");
                } else {
                    setCustomer(data.client);
                }
            } catch (err) {
                console.log(err);
                toast.error("Failed to load customer" + (err instanceof Error ? `: ${err.message}` : ""));
            }
            setLoading(false);
        }

        if (customerId) loadCustomer();
    }, [customerId]);

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto p-6">
                <PageHeader />
                <p className="text-center text-blue-600 mt-10">Loading...</p>
            </div>
        );
    }

    if (!customer) {
        return (
            <div className="max-w-7xl mx-auto p-6">
                <PageHeader />
                <p className="text-center text-red-600 font-medium mt-10">
                    Customer not found
                </p>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto p-6">
            <PageHeader />
            <ProvideLoanForm customer={customer} />
        </div>
    );
}
