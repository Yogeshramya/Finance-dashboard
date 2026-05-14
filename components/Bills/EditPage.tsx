"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Bill } from "@/types/bill";

interface EditBillPageProps {
    billId: string;
}

export default function EditBillPage({ billId }: EditBillPageProps) {
    const router = useRouter();
    const [bill, setBill] = useState<Bill | null>(null);



    async function saveBill() {
        const res = await fetch(`/api/bill/${billId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(bill)
        });

        if (res.ok) {
            toast.success("Bill updated!");
            router.push("/dashboard/bill");
        } else {
            toast.error("Update failed");
        }
    }

    useEffect(() => {
        async function loadBill() {
            const res = await fetch(`/api/bill/${billId}`);
            const data = await res.json();
            setBill(data);
        }
        loadBill();
    }, [billId]);

    if (!bill) return <p className="p-10 text-center">Loading...</p>;

    return (
        <main className="max-w-2xl mx-auto p-6 space-y-4">
            <h1 className="text-2xl font-bold mb-4">Edit Bill</h1>

            <div className="space-y-3">
                <label>Total Collected</label>
                <Input
                    type="number"
                    value={bill.totalCollected}
                    onChange={(e) => setBill({ ...bill, totalCollected: Number(e.target.value) })}
                />
            </div>

            <div className="space-y-3">
                <label>Week No</label>
                <Input
                    type="number"
                    value={bill.weekNo}
                    onChange={(e) => setBill({ ...bill, weekNo: Number(e.target.value) })}
                />
            </div>

            <Button className="bg-green-600" onClick={saveBill}>
                Save Changes
            </Button>
        </main>
    );
}
