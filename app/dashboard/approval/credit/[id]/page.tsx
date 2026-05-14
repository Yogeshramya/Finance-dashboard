"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Credit } from "@/types/credit";

import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import CreditApprovalForm from "@/components/Credits/ApprovalForm";

export default function CreditApprovalPage() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();

    const [credit, setCredit] = useState<Credit | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchCredit() {
            try {
                setLoading(true);

                const res = await fetch(`/api/credit/${id}`);

                if (!res.ok) {
                    throw new Error("Failed to fetch credit");
                }

                const data = await res.json();
                setCredit(data.credit);
            } catch (error) {
                console.log(error);
                toast.error("Unable to load credit details");
                router.push("/dashboard/approval/credit");
            } finally {
                setLoading(false);
            }
        }
        if (id) fetchCredit();
    }, [id, router]);



    if (loading) {
        return (
            <div className="p-6 text-center text-gray-500">
                Loading credit details...
            </div>
        );
    }

    if (!credit) {
        return (
            <div className="p-6 text-center space-y-4">
                <p className="text-red-600 font-medium">
                    Credit record not found
                </p>
                <Button onClick={() => router.back()}>
                    Go Back
                </Button>
            </div>
        );
    }

    return <CreditApprovalForm credit={credit} />;
}
